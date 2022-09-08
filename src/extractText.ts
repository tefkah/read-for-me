import textract from 'textract'
import { promisify } from 'util'

const textFromUrl = promisify(textract.fromUrl)
const textFromFile = promisify(textract.fromFileWithPath)
const textFromBuffer = promisify(textract.fromBufferWithMime)

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
      const text = await textFromBuffer(mimeType, file)
      return text as string
    }

    const text = /http:/.test(file)
      ? ((await textFromUrl(file)) as string)
      : ((await textFromFile(file)) as string)

    // const sentences = text?.match(/\S.*?\."?(?=\s|$)/gms);
    return text
  } catch (e) {
    throw new Error(e as string)
  }
}
