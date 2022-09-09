# Talk to me

Create mp3/webms from almost any type of file using MS Edge's TTS api.

Usable as a CLI tool and a library.

Works on most files, both local and remote.

Should support a lot of voices, but I've only tested with the default one.

## Requirements

You need to have `pdftotext` on your path for PDFs, `antiword` for Word. See the `textract` package for specific requirements.

## CLI

### Install

```sh
pnpm add -g read-for-me
# npm i -g read-for-me
# yarn global add read-for-me
```

### Usage

```sh
read-for-me v0.0.1

Usage:
  read-for-me [flags...] <file> [out]

Flags:
      --chunk-size <number>        Size of chunks to split text into. Might be worth experimenting with smaller chunks is conversion fails. (default: 20000)
      --format <value>             Format to use (mp3, mp3low, webm) (default: "mp3")
  -h, --help                       Show help
      --list-voices                List available voices
      --version                    Show version
      --voice <value>              Voice to use (default: "en-US-Jenny")
```

### Examples

```sh
readforme somepdf.pdf
readforme whatever.txt
readforme https://apdfonline.com/somepdf.pdf --voice "en-US-Aria" hiii.mp3
```

## API

Read the buffer yourself. If you do this, you need to pass the mime-type as well.

```ts
import { readForMe } from 'read-for-me'
import fs from 'fs/promises'

const file = await fs.readFile('somepdf.pdf')
const mp3 = await readForMe({
  file,
  mimeType: 'application/pdf',
  format: 'mp3',
  voice: 'en-US-Aria',
  chunkSize: 20000,
})
```

You can of course also pass it a URL or location

```ts
import { readForMe } from 'read-for-me'

const mp3 = await readForMe({
  file: 'https://apdfonline.com/somepdf.pdf',
  format: 'mp3',
  voice: 'en-US-Aria',
  chunkSize: 20000,
})
```

## Development

```sh
pnpm i
```
