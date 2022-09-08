import { cli } from 'cleye'
import { voiceNames } from './voiceNames'
import { talkToMe } from './talkToMe'
import packageJSON from '../package.json'

const possibleFormats = ['mp3low', 'mp3', 'webm'] as const
export const formats = {
  mp3low: 'audio-24khz-48kbitrate-mono-mp3',
  mp3: 'audio-24khz-48kbitrate-mono-mp3',
  webm: 'webm-24khz-16bit-mono-opus',
}

export type Formats = typeof possibleFormats[number]
export type VoiceNames = typeof voiceNames[number]

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
  version: packageJSON.version,
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
    chunkSize: {
      type: Number,
      description:
        'Size of chunks to split text into. Might be worth experimenting with smaller chunks is conversion fails.',
      default: 20000,
    },
    listVoices: {
      type: Boolean,
      description: 'List available voices',
    },
  },
})

const main = async () => {
  const { file, out } = argv._
  const { listVoices, voice, format, chunkSize } = argv.flags

  if (listVoices) {
    console.dir(voiceNames, { depth: null })
    return
  }

  console.log(`Extracting text from ${file}`)
  talkToMe({ file, out, voice, format, chunkSize, log: true })
}

main()
