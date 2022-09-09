import { createWriteStream } from 'fs'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { formats, Formats, VoiceNames } from './types.js'
import consola from 'consola'
import ora from 'ora'
import streamToPromise from 'stream-to-promise'

/**
 * Apperently the tts engine is not very good at pronouncing & and will silently fail if you provide it with it
 */
const cleanText = (text: string) =>
  text
    .replace(/\&/g, 'and')
    .replace(/\u{000c}|`/gu, '')
    .replace(/</g, 'less than')
    .replace(/>/g, 'greater than')

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
  idx?: number
}

export function textToAudio(
  opts: TextToAudioOptions & { out: string; idx: number }
): Promise<undefined>
export function textToAudio(
  opts: Omit<TextToAudioOptions, 'out'>
): Promise<Buffer>
export async function textToAudio({
  text,
  voice = 'en-US-Jenny',
  format = 'mp3',
  out,
  idx,
}: TextToAudioOptions) {
  const tts = new MsEdgeTTS()
  const chunkName = out || `chunk ${(idx ?? 0) + 1}`

  consola.info(
    `Generating audio file ${chunkName} from a chunk of ${text.length} characters`
  )
  await tts.setMetadata(`${voice}Neural`, formats[format] as OUTPUT_FORMAT)

  let timer = setTimeout(() => {
    console.error(
      'There seems to be something wrong, probably becaus the file is too big\nor because it contains some invalid characters, quitting!'
    )
    console.error(`The text that caused the error is ${chunkName}: ${text}`)
    return process.exit(1)
  }, 20000)

  const spinner = ora(`Downloading audio for ${chunkName}`).start()
  const stream = tts.toStream(cleanText(text))
  let bytes = 0

  const intl = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    useGrouping: true,
  })

  if (!out) {
    // return a promise that resolves with the output of the stream, and rejects if there is an error or the timeout finishes
    const buffers: Buffer[] = []
    stream.on('data', (chunk) => {
      clearTimeout(timer)
      bytes += chunk.length
      spinner.text = `Processed ${intl.format(bytes)} bytes for ${chunkName}`
      buffers.push(chunk)
    })

    return new Promise((resolve, reject) => {
      stream.on('end', () => {
        clearTimeout(timer)
        spinner.succeed()
        resolve(Buffer.concat(buffers))
      })
      stream.on('error', (err) => {
        clearInterval(timer)
        spinner.fail()
        reject(err)
      })
    })
  }
  stream.on('data', (chunk) => {
    timer.refresh()
    bytes += chunk.length
    spinner.text = `Processed ${intl.format(bytes)} bytes of ${chunkName}`
  })

  const file = createWriteStream(out)

  stream.pipe(file)

  stream.on('error', (err) => consola.error(new Error(err.message)))
  file.on('error', (err) => consola.error(new Error(err.message)))

  file.on('finish', () => {
    stream.destroy()
    spinner.stopAndPersist()
    consola.success('Finished processing!')
    return process.exit(0)
  })
}
