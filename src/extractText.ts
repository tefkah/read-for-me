import consola from 'consola'
import textract, { Config, URLConfig } from 'textract'
import { promisify } from 'util'

const textFromUrl = promisify<string | URL, URLConfig, string>(textract.fromUrl)
const textFromFile = promisify<string, Config, string>(
  textract.fromFileWithPath
)
const textFromBuffer = promisify<string, Buffer, Config, string>(
  textract.fromBufferWithMime
)

const defaultExtractOptions: Config = {
  pdftotextOptions: {
    encoding: 'ASCII7',
  },
}

export function extractText(file: string, options?: URLConfig): Promise<string>
export function extractText(
  file: Buffer,
  mimeType: string,
  options?: URLConfig
): Promise<string>
export async function extractText(
  file: string | Buffer,
  mimeType?: string | URLConfig,
  options?: URLConfig
): Promise<string> {
  try {
    const opts = {
      ...defaultExtractOptions,
      ...(typeof mimeType === 'object' ? mimeType : options || {}),
    }
    if (typeof file === 'object') {
      if (typeof mimeType !== 'string')
        throw new Error('mimeType is required when passing a buffer')
      const text = await textFromBuffer(mimeType, file, {
        ...defaultExtractOptions,
        ...options,
      })
      return text as string
    }

    const text = /^https?:/.test(file)
      ? ((await textFromUrl(file, opts)) as string)
      : ((await textFromFile(file, opts)) as string)

    // const sentences = text?.match(/\S.*?\."?(?=\s|$)/gms);
    return text
  } catch (e) {
    console.error('Maybe try providing --typeOverride pdf')
    throw new Error(e as string)
  }
}
