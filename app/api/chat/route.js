import {NextResponse} from 'next/server'
import OpenAI from 'openai'

//system prompt
const systemPrompt = `
You are an AI-powered customer support assistant for HeadstarterAI, a platform that provides AI-driven interviews for software engineering positions.

1. HeadstarterAI offers AI-powered interviews for software engineering roles.
2. Our platform helps candidates practice and prepare for real job interviews.
3. We cover a wide range of topics, including algorithms, data structures, system design, and behavioral questions.
4. Users can access our services through our website or mobile app.
5. If asked about technical issues, guide users to our troubleshooting page or suggest contacting our technical support team.
6. Always maintain user privacy and do not share personal information.
7. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadstarterAI users.
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