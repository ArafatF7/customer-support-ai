import {NextResponse} from 'next/server'
import OpenAI from 'openai'

//system prompt
const systemPrompt = `
You are TechWiseAI, an AI-powered customer support assistant designed to help users navigate and utilize TechWiseAI, a platform that suggests the best technology products based on the client's needs. Your role is to assist users in finding the most suitable technology products, answer questions about different tech categories, and provide guidance on how to use the platform effectively.

1. TechWiseAI helps users identify the best technology products tailored to their specific needs and preferences.
2. Our platform covers a wide range of tech products, including laptops, smartphones, smart home devices, and more.
3. Assist users in refining their search by understanding their requirements and preferences.
4. If users encounter any issues with the platform, guide them to troubleshooting resources or suggest contacting our support team.
5. Maintain user privacy and ensure that all interactions are secure and confidential.
6. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

Your goal is to provide accurate recommendations, assist with common inquiries, and ensure a positive experience for all TechWiseAI users.
`;

// POST function to handle incoming requests
export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request
  

    /*await function makes it so it doesn't block your code, while you're 
    waiting, that means multiple requests can be sent at the same time */
    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
        model: 'gpt-4o', // Specify the model to use
        stream: true, // Enable streaming responses
      })
    
      // Create a ReadableStream to handle the streaming response
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
          try {
            // Iterate over the streamed chunks of the response
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
              if (content) {
                const text = encoder.encode(content) // Encode the content to Uint8Array
                controller.enqueue(text) // Enqueue the encoded text to the stream
              }
            }
          } catch (err) {
            controller.error(err) // Handle any errors that occur during streaming
          } finally {
            controller.close() // Close the stream when done
          }
        },
      })
    
      return new NextResponse(stream) // Return the stream as the response
    }