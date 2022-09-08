import { cli } from 'cleye'
import { voiceNames } from './voiceNames.js'
import { readForMe } from './readForMe.js'
import { version, description } from '../package.json'
import { VoiceNames, VoiceName, Formats, Format } from './types.js'
import consola from 'consola'

const argv = cli({
  name: 'readforme',
  parameters: ['<file>', '[out]'],
  version,
  help: {
    description,
    usage: 'readforme <file> [out]',
    examples: [
      'readforme somepdf.pdf',
      'readforme whatever.txt --format webm',
      'readforme https://apdfonline.com/somepdf.pdf --voice "en-US-Aria" hiii.mp3',
    ],
  },
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
  // makes output prettier
  consola.wrapConsole()

  const { file, out } = argv._
  const { listVoices, voice, format, chunkSize } = argv.flags

  if (listVoices) {
    console.dir(voiceNames, { depth: null })
    return
  }

  console.info(`Extracting text from ${file}`)
  readForMe({ file, out, voice, format, chunkSize, log: true })
}

main()
