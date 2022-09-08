import { execaCommand } from 'execa'
import { readFile, rename, unlink } from 'fs/promises'
import { format } from 'path'
import { Formats, VoiceNames } from './cli'
import { extractText } from './extractText'
import { splitText } from './splitText'
import { textToAudio } from './textToAudio'

export interface TalkToMe {
  file: string | Buffer
  /** The size  of the chunks to split the text into */
  chunkSize: number
  /** output file name */
  out?: string
  /** Mimetype of the file, required when passing a buffer */
  mimeType?: string
  /** The format of the output */
  format: Formats
  /** The voice to use */
  voice: VoiceNames
  /** Whether to show console.log messages */
  log?: boolean
}

const createWriteableName = (name: string, format: string) =>
  `${name.replace(/https?:\/\/|\/|:|\\|\./g, '')}.${format.replace('low', '')}`

export function talkToMe(
  props: Omit<TalkToMe, 'out'> & { mimeType: string; file: Buffer }
): Promise<Buffer>
export function talkToMe(
  props: Omit<TalkToMe, 'mimeType'> & { file: string }
): Promise<void>
export async function talkToMe({
  file,
  mimeType,
  chunkSize,
  format,
  voice,
  out,
  log = false,
}: TalkToMe): Promise<void | Buffer> {
  if (typeof file !== 'string' && !mimeType)
    throw new Error('mimeType is required when passing a buffer')

  const text =
    typeof file === 'string'
      ? await extractText(file)
      : // @ts-expect-error this should be inferred correctly
        await extractText(file, mimeType)

  if (!text) {
    throw new Error('Could not extract text from file')
  }

  const lines = text.length < chunkSize ? [text] : splitText(text, chunkSize)

  const name =
    typeof file === 'object'
      ? 'temp'
      : out
      ? out
      : createWriteableName(file, format)

  const audios = await Promise.all(
    lines.map(async (line, idx) => {
      const tempName = `${idx}${name}`
      return await textToAudio({
        text: line,
        voice,
        format,
        out: tempName,
      })
    })
  )

  if (audios.length === 1) {
    await rename(`0${name}`, name)
    log && console.log("That's all folks!")
    return
  }

  log && console.log('Concatenating audio files...')
  const final = await execaCommand(
    `ffmpeg ${audios.map((_, idx) => ` -i ${idx}${name}`).join('')} ${name} -y`
  )

  log && console.log(final.stdout, final.stderr)

  log && console.log('Cleaning up...')
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

  if (typeof file === 'object') {
    return await readFile(name)
  }
  log && console.log('Done!')
}
