import { DatabaseService } from "./services/database"
import { WebScraper } from "./services/scraper"
import { EmbeddingService } from "./services/embedding"
import { TextProcessor } from "./services/textProcessor"
import { INVESTMENT_DATA_URLS } from "./data"

async function loadSampleData() {
  try {
    console.log("Starting data loading process...")
    
    for (const url of INVESTMENT_DATA_URLS) {
      console.log(`Processing URL: ${url}`)
      
      // Scrape content
      const content = await WebScraper.scrapeUrl(url)
      if (!content.trim()) {
        console.log(`No content found for URL: ${url}`)
        continue
      }
      
      // Split into chunks
      const chunks = await TextProcessor.splitText(content)
      console.log(`Split content into ${chunks.length} chunks`)
      
      // Create embeddings for all chunks
      const embeddings = await EmbeddingService.createEmbeddings(chunks)
      console.log(`Created ${embeddings.length} embeddings`)
      
      // Insert into database
      await DatabaseService.insertDocuments(embeddings)
      console.log(`Inserted data for URL: ${url}`)
    }
    
    console.log("Data loaded!")
  } catch (error) {
    console.error("Error loading data:", error)
    throw error
  }
}

async function main() {
  try {
    // Create collection first
    await DatabaseService.createCollection()
    
    // Load sample data
    await loadSampleData()
  } catch (error) {
    console.error("Main execution failed:", error)
    process.exit(1)
  }
}

// Run the main function
main() 