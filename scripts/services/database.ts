import { DataAPIClient } from "@datastax/astra-db-ts"
import { config } from "../config"
import { SimilarityMetric } from "../types"

export class DatabaseService {
  private static client = new DataAPIClient(config.astra.applicationToken)
  private static db = this.client.db(config.astra.apiEndpoint, { keyspace: config.astra.namespace })

  static async createCollection(similarityMetric: SimilarityMetric = "dot_product") {
    const res = await this.db.createCollection(config.astra.collection, {
      vector: {
        dimension: config.vector.dimension,
        metric: similarityMetric
      }
    })
    console.log(`Collection ${config.astra.collection} created with metric ${similarityMetric}: ${res}`)
    return res
  }

  static async getCollection() {
    return await this.db.collection(config.astra.collection)
  }

  static async insertDocument(vector: number[], text: string) {
    const collection = await this.getCollection()
    const res = await collection.insertOne({
      $vector: vector,
      text
    })
    console.log(`Inserted document into collection: ${res}`)
    return res
  }

  static async insertDocuments(documents: Array<{ vector: number[], text: string }>) {
    const collection = await this.getCollection()
    const res = await collection.insertMany(documents.map(doc => ({
      $vector: doc.vector,
      text: doc.text
    })))
    console.log(`Inserted ${documents.length} documents into collection: ${res}`)
    return res
  }
} 