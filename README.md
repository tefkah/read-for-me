# Talk to me

Create mp3/webms from almost any type of file using MS Edge's TTS api.

Usable as a CLI tool and a library.

Works on most files, both local and remote.

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

```ts
import { readForMe } from 'read-for-me'
import fs from 'fs/promises'
```
