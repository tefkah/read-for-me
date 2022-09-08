import textract from 'textract';
import { promisify } from 'util';

const textFromUrl = promisify(textract.fromUrl);
const textFromFile = promisify(textract.fromFileWithPath);

export const extractText = async (path: string) => {
  try {
    const text = /http:/.test(path)
      ? ((await textFromUrl(path)) as string)
      : ((await textFromFile(path)) as string);

    // const sentences = text?.match(/\S.*?\."?(?=\s|$)/gms);
    const sentences = text;

    return sentences;
  } catch (e) {
    throw new Error(e as string);
  }
};
