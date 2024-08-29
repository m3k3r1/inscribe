// import { Ratelimit } from '@upstash/ratelimit'
// import { kv } from '@vercel/kv'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createMistral } from '@ai-sdk/mistral'
import { createOpenAI } from '@ai-sdk/openai'
import { type CoreMessage, type LanguageModel, streamText } from 'ai'
import { match } from 'ts-pattern'

import { getCurrentOrg } from '@/auth/auth'
import { updateTokenUsage } from '@/http/update_token_count'

import { systemGhostWritterPrompt } from './prompts'

// Create an OpenAI API client (that's edge friendly!)

// IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
export const runtime = 'edge'

export async function POST(req: Request): Promise<Response> {
  const currentOrg = getCurrentOrg()

  const anthropic = createAnthropic({})
  const mistral = createMistral({})
  const openai = createOpenAI({
    compatibility: 'strict',
  })

  // if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  //   const ip = req.headers.get('x-forwarded-for')
  //   const ratelimit = new Ratelimit({
  //     redis: kv,
  //     limiter: Ratelimit.slidingWindow(50, '1 d'),
  //   })

  //   const { success, limit, reset, remaining } = await ratelimit.limit(
  //     `novel_ratelimit_${ip}`,
  //   )

  //   if (!success) {
  //     return new Response('You have reached your request limit for the day.', {
  //       status: 429,
  //       headers: {
  //         'X-RateLimit-Limit': limit.toString(),
  //         'X-RateLimit-Remaining': remaining.toString(),
  //         'X-RateLimit-Reset': reset.toString(),
  //       },
  //     })
  //   }
  // }

  const { prompt, option, command, context, model, language, project } =
    await req.json()

  const llm = match(model.value)
    .with('gpt-4o', () => {
      return openai('gpt-4o')
    })
    .with('gpt-4o-mini', () => {
      return openai('gpt-4o-mini')
    })
    .with('claude-3-5-sonnet-20240620', () => {
      return anthropic('claude-3-5-sonnet-20240620')
    })
    .with('mistral-large-latest', () => {
      return mistral('mistral-large-latest')
    })
    .run() as LanguageModel

  const messages = match(option)
    .with('continue', () => [
      {
        role: 'system',
        content:
          'You are an AI writing assistant that continues existing text based on context from prior text. ' +
          'Give more weight/priority to the later characters than the beginning ones. ' +
          'Limit your response to no more than 200 characters, but make sure to construct complete sentences.' +
          'Use Markdown formatting when appropriate.',
      },
      {
        role: 'user',
        content: `${prompt} .Use the language: ${language.value}`,
      },
    ])
    .with('improve', () => [
      {
        role: 'system',
        content:
          'You are an AI writing assistant that improves existing text. ' +
          'Limit your response to no more than 200 characters, but make sure to construct complete sentences.' +
          'Use Markdown formatting when appropriate.' +
          'Return only the result of your task.' +
          `Use the language: ${language.value}`,
      },
      {
        role: 'user',
        content: `
        The existing text is: 
        "${prompt}"
        Be aware of the optional context:  
        "${context}"    
        `,
      },
    ])
    .with('shorter', () => [
      {
        role: 'system',
        content:
          'You are an AI writing assistant that shortens existing text. ' +
          'Use Markdown formatting when appropriate.' +
          'Return only the result of your task.' +
          `Use the language: ${language.value}`,
      },
      {
        role: 'user',
        content: `
        The existing text is: 
        "${prompt}"
        Be aware of the optional context:  
        "${context}"    
        `,
      },
    ])
    .with('longer', () => [
      {
        role: 'system',
        content:
          'You are an AI writing assistant that lengthens existing text. ' +
          'Use Markdown formatting when appropriate.' +
          'Return only the result of your task.',
      },
      {
        role: 'user',
        content: `The existing text is: ${prompt}
                Use the language: ${language.value}
        `,
      },
    ])
    .with('fix', () => [
      {
        role: 'system',
        content:
          'You are an AI writing assistant that fixes grammar and spelling errors in existing text. ' +
          'Limit your response to no more than 200 characters, but make sure to construct complete sentences.' +
          'Use Markdown formatting when appropriate.' +
          'Return only the result of your task.',
      },
      {
        role: 'user',
        content: `The existing text is: ${prompt}
                Use the language: ${language.value}`,
      },
    ])
    .with('zap', () => [
      {
        role: 'system',
        content:
          'You area an AI writing assistant that generates text based on a prompt. ' +
          'You take an input from the user and a command for manipulating the text' +
          'Use Markdown formatting when appropriate.',
      },
      {
        role: 'user',
        content: `
        For this text: ${prompt}. 
        You have to respect the command: ${command}   
        Be aware of the optional context: 
          
        "${context}"    

        You should ignore any '[dataset-block-<ID>]' tag that might appear

          Use the language: ${language.value}`,
      },
    ])
    .with('command', () => [
      {
        role: 'system',
        content: systemGhostWritterPrompt,
      },
      {
        role: 'user',
        content: `
          Complete this task ${prompt}.  
          Be aware of the optional context: 
          
          "${context}"

          Use Markdown formatting when appropriate.
          Return only the result of your task.

          Use the language: ${language.value}
        `,
      },
    ])
    .with('magic', () => [
      {
        role: 'system',
        content: systemGhostWritterPrompt,
      },
      {
        role: 'user',
        content: `
          Categorize this list of blocks into sections to write an amazing article about this:
          
          ${context}

          Use this blocks to create the sections of the article.
          Each section must create a strong connection with the topic and the other sections.           
          Use a section title/separation only when it makes sense.
          And be a full interesting article
          The blocks dont need to be in order, you can reorder them as you see fit, and can also be used more than once.
          
          Use the users language: ${language}
          `,
      },
      {
        role: 'user',
        content: `
          Write the article organized in the sections created in the previous step, you can only write the sections 
          you are given. 
         
          With the information of the blocks and the blocks only
          ""${context}""
        
          The text must flow naturally and be easy to read with a catchy flow and a hook title. 
          Must have connection with the topic and in between sections.
          Use a section title only when it makes sense.
          Use Markdown formatting when appropriate.,
          You should ignore any '[dataset-block-<ID>]' tag that might appear

          Use the users language: ${language}
        `,
        // You should keep the markdown tag where you took the information to generate a given sentence.
        // should be placed in the beginning of the sentence.
        // like this: [dataset-block-1] <content>
      },
    ])
    .run() as CoreMessage[]

  const stream = await streamText({
    model: llm,
    messages,
    temperature: 1,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    experimental_telemetry: { isEnabled: true },
  })

  stream.usage.then(async (usage) => {
    const { promptTokens, completionTokens, totalTokens } = usage
    await updateTokenUsage(currentOrg!, project, {
      totalTokens,
      promptTokens,
      completionTokens,
    })
  })

  return stream.toDataStreamResponse()
}
