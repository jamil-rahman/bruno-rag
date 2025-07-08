import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"

export class WebScraper {
  static async scrapeUrl(url: string): Promise<string> {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: process.env.CHROME_PATH || undefined
      },
      gotoOptions: {
        waitUntil: "domcontentloaded"
      },
      evaluate: async (page, browser) => {
        const result = await page.evaluate(() => document.body.innerText)
        await browser.close()
        return result
      }
    })
    
    const scrapedContent = await loader.scrape()
    return scrapedContent?.replace(/<[^>]*>?/g, "") || ""
  }
} 