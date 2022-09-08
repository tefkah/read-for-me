export const splitText = (text: string, CHUNK_SIZE: number) => {
  const lines = text.split('. ')
  const chunks = []
  let chunk = ''
  for (const line of lines) {
    if (chunk.length + line.length < CHUNK_SIZE) {
      chunk += `${line}. `
    } else {
      chunks.push(chunk)
      chunk = line
    }
  }
  chunks.push(chunk)
  return chunks
}
