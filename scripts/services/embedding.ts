import OpenAI from "openai"
import { config } from "../config"
import { EmbeddingResult } from "../types"

export class EmbeddingService {
  private static openai = new OpenAI({ apiKey: config.openai.apiKey })

  static async createEmbedding(text: string): Promise<EmbeddingResult> {
    const embedding = await this.openai.embeddings.create({
      model: config.vector.model,
      input: text,
      encoding_format: "float"
    })
    
    return {
      vector: embedding.data[0].embedding,
      text
    }
  }

  static async createEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const embeddings = await this.openai.embeddings.create({
      model: config.vector.model,
      input: texts,
      encoding_format: "float"
    })
    
    return embeddings.data.map((item, index) => ({
      vector: item.embedding,
      text: texts[index]
    }))
  }
} 