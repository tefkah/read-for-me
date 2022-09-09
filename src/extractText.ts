import consola from 'consola'
import textract, { Config } from 'textract'
import { promisify } from 'util'

const textFromUrl = promisify<string | URL, Config, string>(textract.fromUrl)
const textFromFile = promisify<string, Config, string>(
  textract.fromFileWithPath
)
const textFromBuffer = promisify<string, Buffer, Config, string>(
  textract.fromBufferWithMime
)

const extractTextOptions: Config = {
  pdftotextOptions: {
    encoding: 'ASCII7',
  },
}

export function extractText(file: string): Promise<string>
export function extractText(file: Buffer, mimeType: string): Promise<string>
export async function extractText(
  file: string | Buffer,
  mimeType?: string
): Promise<string> {
  try {
    if (typeof file === 'object') {
      if (!mimeType)
        throw new Error('mimeType is required when passing a buffer')
      const text = await textFromBuffer(mimeType, file, extractTextOptions)
      return text as string
    }

    const text = /http:/.test(file)
      ? ((await textFromUrl(file, extractTextOptions)) as string)
      : ((await textFromFile(file, extractTextOptions)) as string)

    // const sentences = text?.match(/\S.*?\."?(?=\s|$)/gms);
    return text
  } catch (e) {
    throw new Error(e as string)
  }
}
