import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { config } from "../config"

// Split the text into chunks of 512 characters with 100 characters of overlap
// Use the separators: ["\n\n", "\n", " ", ""]
export class TextProcessor {
  private static splitter = new RecursiveCharacterTextSplitter({
    chunkSize: config.textSplitter.chunkSize,
    chunkOverlap: config.textSplitter.chunkOverlap,
    separators: [...config.textSplitter.separators]
  })

  
  static async splitText(text: string): Promise<string[]> {
    return await this.splitter.splitText(text)
  }

  static async splitTexts(texts: string[]): Promise<string[]> {
    const allChunks: string[] = []
    for (const text of texts) {
      const chunks = await this.splitText(text)
      allChunks.push(...chunks)
    }
    return allChunks
  }
} 