import { createWriteStream } from 'fs'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { formats, Formats, VoiceNames } from './types.js'
import consola from 'consola'
import ora from 'ora'
import streamToPromise from 'stream-to-promise'

/**
 * Apperently the tts engine is not very good at pronouncing & and will silently fail if you provide it with it
 */
const cleanText = (text: string) => text.replace(/&/g, 'and')

export const textToAudioFile = async ({
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
type TextToAudioOptions = {
  text: string
  voice?: VoiceNames
  format?: Formats
  out?: string
}

export function textToAudio(
  opts: TextToAudioOptions & { out: string }
): Promise<undefined>
export function textToAudio(
  opts: Omit<TextToAudioOptions, 'out'>
): Promise<Buffer>
export async function textToAudio({
  text,
  voice = 'en-US-Jenny',
  format = 'mp3',
  out,
}: TextToAudioOptions) {
  const tts = new MsEdgeTTS()

  consola.info(
    `Generating audio file ${out} from a chunk of ${text.length} characters`
  )
  await tts.setMetadata(`${voice}Neural`, formats[format] as OUTPUT_FORMAT)

  const spinner = ora(`Downoading audio`).start()
  const stream = tts.toStream(cleanText(text))
  if (!out) {
    return await streamToPromise(stream)
  }

  const file = createWriteStream(out)

  let bytes = 0
  stream.pipe(file)
  const intl = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    useGrouping: true,
  })
  let timer = setInterval(() => {
    console.error(
      'There seems to be something wrong, probably becausle is too big or because it contains some invalid characters, quitting!'
    )
    return process.exit(1)
  }, 10000)

  stream.on('data', (chunk) => {
    timer.refresh()
    bytes += chunk.length
    spinner.text = `Processed ${intl.format(bytes)} bytes`
  })

  stream.on('error', (err) => consola.error(new Error(err.message)))
  file.on('error', (err) => consola.error(new Error(err.message)))

  file.on('finish', () => {
    stream.destroy()
    spinner.stopAndPersist()
    consola.success('Finished processing!')
    return process.exit(0)
  })
}
