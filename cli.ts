import { exec } from 'child_process'
import { cli } from 'cleye'
import { execa, execaCommand, execaCommandSync } from 'execa'
import { fstat } from 'fs'
import { link, unlink, rename, writeFile } from 'fs/promises'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { extractText } from './pdfToText'
import { voiceNames } from './voiceNames'

const CHUNK_SIZE = 20000

const possibleFormats = ['mp3low', 'mp3', 'webm'] as const
const formats = {
  mp3low: 'audio-24khz-48kbitrate-mono-mp3',
  mp3: 'audio-24khz-48kbitrate-mono-mp3',
  webm: 'webm-24khz-16bit-mono-opus',
}

type Formats = typeof possibleFormats[number]
type VoiceNames = typeof voiceNames[number]

const VoiceName = (voice: VoiceNames) => {
  if (!voiceNames.includes(voice)) {
    throw new Error(
      `Voice ${voice} not found, use --voices to see available voices`
    )
  }
  return voice
}
const Format = (format: Formats) => {
  if (!possibleFormats.includes(format)) {
    throw new Error(
      `Format ${format} not found, use --formats to see available formats`
    )
  }
  return format
}

const argv = cli({
  name: 'talk-to-me',
  parameters: ['<file>', '[out]'],
  flags: {
    voice: {
      type: VoiceName,
      description: 'Voice to use',
      default: 'en-US-Jenny' as VoiceNames,
    },
    format: {
      type: Format,
      description: 'Format to use (mp3, webm)',
      default: 'mp3' as Formats,
    },
  },
})

const splitText = (text: string) => {
  const lines = text.split('. ')
  const chunks = []
  let chunk = ''
  for (const line of lines) {
    if (chunk.length + line.length < CHUNK_SIZE) {
      chunk += `${line}. `
    } else {
      chunks.push(chunk)
      chunk = line
    }
  }
  chunks.push(chunk)
  return chunks
}

const createWriteableName = (name: string, format: string) =>
  `${name.replace(/https?:\/\/|\/|:|\\|\./g, '')}.${format.replace('low', '')}`
const main = async () => {
  const { file, out } = argv._
  const { voice, format } = argv.flags

  console.log(`Extracting text from ${file}`)
  const text = await extractText(file)
  if (!text) {
    throw new Error('Could not extract text from file')
  }

  const lines = text.length < CHUNK_SIZE ? [text] : splitText(text)

  console.log(lines)

  const name = out ? out : createWriteableName(file, format)
  const audios = await Promise.all(
    lines.map(async (line, idx) => {
      const tempName = `${idx}${name}`
      return await convert({
        text: line,
        voice,
        format,
        out: tempName,
      })
    })
  )

  if (audios.length === 1) {
    await rename(`0${name}`, name)
    console.log("That's all folks!")
    return
  }

  console.log('Concatenating audio files...')
  const final = await execaCommand(
    `ffmpeg ${audios.map((_, idx) => ` -i ${idx}${name}`).join('')} ${name} -y`
  )

  console.log(final.stdout, final.stderr)

  console.log(final)
  console.log('Cleaning up...')
  const unlinked = await Promise.all(
    audios.map(async (audio, idx) => {
      if (audio === out) return
      try {
        return await unlink(`${idx}${name}`)
      } catch (e) {
        console.error(e)
      }
    })
  )

  console.log('Done!')
}

const convert = async ({
  text,
  voice = 'en-US-Jenny',
  format = 'mp3',
  out,
}: {
  text: string
  voice?: VoiceNames
  format?: Formats
  out: string
}) => {
  const tts = new MsEdgeTTS(true)

  await tts.setMetadata(`${voice}Neural`, formats[format] as OUTPUT_FORMAT)

  console.log(`Generating audio file ${out}`)

  const filePath = await tts.toFile(out, text)
  await writeFile('temp.txt', text)

  return
}

await main()
