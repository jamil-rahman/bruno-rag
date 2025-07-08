import { openai } from '@ai-sdk/openai';
import { streamText, embed } from "ai"
import { DataAPIClient } from "@datastax/astra-db-ts";

// Check if all required environment variables are set
if (!process.env.ASTRA_DB_NAMESPACE ||
    !process.env.ASTRA_DB_COLLECTION ||
    !process.env.ASTRA_DB_API_ENDPOINT ||
    !process.env.ASTRA_DB_APPLICATION_TOKEN ||
    !process.env.OPENAI_API_KEY) {
    throw new Error('Required environment variables are not set in .env');
}

const ASTRA_DB_NAMESPACE = process.env.ASTRA_DB_NAMESPACE;
const ASTRA_DB_COLLECTION = process.env.ASTRA_DB_COLLECTION;
const ASTRA_DB_API_ENDPOINT = process.env.ASTRA_DB_API_ENDPOINT;
const ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE })

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        const latestMessage = messages[messages.length - 1].content

        let context = ""
        let documents = []

        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: latestMessage
        });

        try {
            const collection = db.collection(ASTRA_DB_COLLECTION)

            const cursor = await collection.find(
                {},
                {
                    sort: {
                        $vector: embedding
                    },
                    limit: 10,
                }
            );
            
            documents = await cursor.toArray()
            context = documents.map(doc => doc.text).join('\\n')

            // Debug logging to verify retrieval
            console.log('=== RAG DEBUG INFO ===')
            console.log('Query:', latestMessage)
            console.log('Embedding length:', embedding.length)
            console.log('Documents retrieved:', documents.length)
            console.log('Context preview:', context.substring(0, 200) + '...')
            console.log('Document text previews:', documents.map(doc => doc.text?.substring(0, 50) + '...').slice(0, 3))
            console.log('=== END DEBUG INFO ===')

        } catch (dbError) {
            console.error('Astra DB query failed:', dbError);
            return new Response('Error querying database.', { status: 500 });
        }

        const prompt = {
            role: "system",
            content: `
                You are a helpful assistant called Bruno. You look like an adorable Panda. 
                You know more than the average person about Investing and how to make proper use of your money.
                You are given a conversation history and a latest message.
                You are also given a context of documents that are similar to the latest message.
                You need to use the context to augment the latest message and answer the question or help with the task.
                You need to be concise and to the point.
                You need to be friendly and engaging.
                You need to be helpful and informative.
                You need to be funny and witty.
                You need to be empathetic and understanding.
                You need to be concise and to the point but if the user asks you to elaborate, you should do so.

                The context will provide you with all the information that is available to the public that a normal person will
                find it difficult to search through the internet. You are not allowed to make up any information other than verified infomration.
                
                If the context does not include the best information, let the user know that you don't have the information. Stick to only the provided
                context.You should not make up any information. 
                If the user asks you question that is not related to the context, let them know that you don't have the information and rather ask them to stick
                to the knowledge area you are specialized in.

                Format your response in markdown where appropriate or applicable and use bullet points where appropriate.
                Do not return images or any other media. Only return text.

                IMPORTANT: At the end of your response, always include a small section that shows:
                - Number of relevant documents found: ${documents.length}
                - Context used: ${context.length > 0 ? 'Yes' : 'No'}
                
                This helps verify the RAG system is working.

                ------------------------
                START OF CONTEXT
                ${context}
                ------------------------
                END OF CONTEXT

                ------------------------
                START OF CONVERSATION HISTORY
                Question: ${latestMessage}
                ------------------------
                `
        }

        const result = await streamText({
            model: openai('gpt-4o-mini'),
            messages: [prompt, ...messages],
            temperature: 0.7,
            maxTokens: 1000,
            topP: 1,
        });

        return result.toTextStreamResponse()

    } catch (error) {
        console.error('Error in /chat POST route:', error)
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}

// Debug endpoint to test vector search directly
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query') || 'investment strategies'
    
    try {
        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: query
        });

        const collection = db.collection(ASTRA_DB_COLLECTION)
        const cursor = await collection.find(
            {},
            {
                sort: {
                    $vector: embedding
                },
                limit: 10,
            }
        );
        
        const documents = await cursor.toArray()
        
        return new Response(JSON.stringify({
            query,
            embeddingLength: embedding.length,
            documentsFound: documents.length,
            documents: documents.map(doc => ({
                content: doc.text?.substring(0, 200) + '...',
                title: doc.title || 'Raw scraped text',
                source: doc.source || 'RBC website'
            }))
        }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        })
        
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}