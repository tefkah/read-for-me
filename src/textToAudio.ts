import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { formats, Formats, VoiceNames } from './cli'

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
