import { createWriteStream } from 'fs'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { formats, Formats, VoiceNames } from './types.js'
import consola from 'consola'
import ora from 'ora'

/**
 * Apperently the tts engine is not very good at pronouncing & and will silently fail if you provide it with it
 */
const cleanText = (text: string) => text.replace(/&/g, 'and')

export const textToAudio = async ({
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
  const tts = new MsEdgeTTS()

  await tts.setMetadata(`${voice}Neural`, formats[format] as OUTPUT_FORMAT)

  console.log(`Generating audio file ${out}`)

  const filePath = await tts.toFile(out, cleanText(text))

  return
}

export const textToAudioStream = async ({
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
  const tts = new MsEdgeTTS()

  consola.info(`Generating audio file ${out}`)
  await tts.setMetadata(`${voice}Neural`, formats[format] as OUTPUT_FORMAT)

  const spinner = ora('Downoading audio').start()
  const stream = tts.toStream(cleanText(text))
  const file = createWriteStream(out)

  let bytes = 0
  stream.pipe(file)
  const intl = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    useGrouping: true,
  })

  stream.on('data', (chunk) => {
    bytes += chunk.length
    // logUpdate(`Downloaded ${intl.format(bytes)} bytes`)
    spinner.text = `Processed ${intl.format(bytes)} bytes`
  })

  file.on('error', (err) => consola.error(new Error(err.message)))

  file.on('finish', () => {
    stream.destroy()
    spinner.stopAndPersist()
    consola.success('Finished processing!')
    process.exit(0)
  })
}
