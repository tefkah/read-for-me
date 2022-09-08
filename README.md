# Talk to me

Create mp3/webms from almost any type of file using MS Edge's TTS api.

Usable as a CLI tool and a library.

Works on most files, both local and remote.

## Requirements

You need to have `pdftotext` on your path for PDFs, `antiword` for Word. See the `textract` package for specific requirements.

## CLI

### Install

```sh
pnpm add -g speak-to-me
# npm i -g speak-to-me
# yarn global add speak-to-me
```

### Usage

```sh
speak-to-me v0.0.1

Usage:
  speak-to-me [flags...] <file> [out]

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
speaktome somepdf.pdf
speaktome whatever.txt
speaktome https://apdfonline.com/somepdf.pdf --voice "en-US-Aria" hiii.mp3
```

## API

```ts
import { speakToMe } from 'speak-to-me'
import fs from 'fs/promises'
```
