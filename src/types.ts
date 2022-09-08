import { voiceNames } from './voiceNames'
export const possibleFormats = ['mp3low', 'mp3', 'webm'] as const
export const formats = {
  mp3low: 'audio-24khz-48kbitrate-mono-mp3',
  mp3: 'audio-24khz-48kbitrate-mono-mp3',
  webm: 'webm-24khz-16bit-mono-opus',
}

export type Formats = typeof possibleFormats[number]
export type VoiceNames = typeof voiceNames[number]

export const VoiceName = (voice: VoiceNames) => {
  if (!voiceNames.includes(voice)) {
    throw new Error(
      `Voice ${voice} not found, use --voices to see available voices`
    )
  }
  return voice
}
export const Format = (format: Formats) => {
  if (!possibleFormats.includes(format)) {
    throw new Error(
      `Format ${format} not found, use --formats to see available formats`
    )
  }
  return format
}
