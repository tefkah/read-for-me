import { fstat, writeFileSync } from 'fs';
import { MsEdgeTTS } from 'msedge-tts';
import { OUTPUT_FORMAT } from 'msedge-tts';

const textToWebm = async (input: string) => {
  const tts = new MsEdgeTTS(true);
  console.log('Sending file to MS Edge');
  await tts.setMetadata(
    'en-US-JennyNeural',
    MsEdgeTTS.OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS
  );
  console.log('Writing file...');
  const filePath = await tts.toFile('./exampl_audio.webm', input);
  console.log('Done!');
};

const textToAudio = async ({
  input,
  format,
  voice = 'en-US-JennyNeural',
  out,
}: {
  input: string;
  format: OUTPUT_FORMAT;
  voice?: string;
  out?: string;
}) => {
  const tts = new MsEdgeTTS(true);
  console.log('Sending file to MS Edge');
  await tts.setMetadata(voice, format);
  const outputFile =
    out ?? `${input}-${format}.${format.includes('webm') ? 'webm' : 'mp3'}`;
  console.log(`Writing file ${outputFile}...`);
  try {
    const filePath = await tts.toFile(outputFile, input);
    console.log('Done!');
  } catch (e) {
    console.log(e);
    console.log('Something went wrong');
  }
};

const text =
  "Hello, world! I'm testing whether these sentences are being read correctly.";

const audios = await Promise.all(
  Object.values(OUTPUT_FORMAT).map((format) =>
    textToAudio({ input: text, format, voice: 'en-US-JennyNeural' })
  )
);
