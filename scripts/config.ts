import "dotenv/config"

const { ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY } = process.env

// Validate required environment variables
if (!ASTRA_DB_NAMESPACE) throw new Error("ASTRA_DB_NAMESPACE is required")
if (!ASTRA_DB_COLLECTION) throw new Error("ASTRA_DB_COLLECTION is required")
if (!ASTRA_DB_API_ENDPOINT) throw new Error("ASTRA_DB_API_ENDPOINT is required")
if (!ASTRA_DB_APPLICATION_TOKEN) throw new Error("ASTRA_DB_APPLICATION_TOKEN is required")
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required")

export const config = {
  astra: {
    namespace: ASTRA_DB_NAMESPACE,
    collection: ASTRA_DB_COLLECTION,
    apiEndpoint: ASTRA_DB_API_ENDPOINT,
    applicationToken: ASTRA_DB_APPLICATION_TOKEN,
  },
  openai: {
    apiKey: OPENAI_API_KEY,
  },
  textSplitter: {
    chunkSize: 512,
    chunkOverlap: 100,
    separators: ["\n\n", "\n", " ", ""]
  },
  vector: {
    dimension: 1536,
    model: "text-embedding-3-small"
  }
} as const 