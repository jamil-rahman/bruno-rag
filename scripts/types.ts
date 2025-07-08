export type SimilarityMetric = "cosine" | "dot_product" | "euclidean"

export interface ScrapedContent {
  url: string
  content: string
  chunks: string[]
}

export interface EmbeddingResult {
  vector: number[]
  text: string
} 