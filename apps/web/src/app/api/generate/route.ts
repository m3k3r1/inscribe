// import { Ratelimit } from '@upstash/ratelimit'
// import { kv } from '@vercel/kv'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createMistral } from '@ai-sdk/mistral'
import { createOpenAI } from '@ai-sdk/openai'
import { type CoreMessage, type LanguageModel, streamText } from 'ai'
import { match } from 'ts-pattern'

import { getCurrentOrg } from '@/auth/auth'
import { updateTokenUsage } from '@/http/update_token_count'

import {
  plannerAgentPrompt,
  systemGhostWritterPrompt,
  translatorAgentPrompt,
} from './prompts'

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

  const { prompt, option, command, context, model, language, project, format } =
    await req.json()

  const textFormat = format.value

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
          `You are writting a ${textFormat}` +
          'Give more weight/priority to the later characters than the beginning ones. ' +
          'Limit your response to no more than 200 characters, but make sure to construct complete sentences.' +
          'Use Markdown formatting when appropriate.',
      },
      {
        role: 'user',
        content: `
        ${prompt}
        
        Use the language: ${language.value}
        Output only the result of your task
        `,
      },
    ])
    .with('improve', () => [
      {
        role: 'system',
        content: systemGhostWritterPrompt(textFormat),
      },
      {
        role: 'user',
        content: `
        Improve the given text: 
        "${prompt}"

        Limit your response to no more than 200 characters, but make sure to construct complete sentences.
        Be aware of the optional context, use it only for coesion:  
        "${context}"

        Use the language: ${language.value}
        
        Output only the result of your task
        `,
      },
    ])
    .with('shorter', () => [
      {
        role: 'system',
        content:
          'You are an AI writing assistant that shortens existing text. ' +
          `You are writting a ${textFormat}` +
          'Use Markdown formatting when appropriate.',
      },
      {
        role: 'user',
        content: `
        The existing text is: 
        "${prompt}"
           
        Use the language: ${language.value}
        Output only the result of your task
        `,
      },
    ])
    .with('longer', () => [
      {
        role: 'system',
        content:
          'You are an AI writing assistant that lengthens existing text. ' +
          `You are writting a ${textFormat}` +
          'Use Markdown formatting when appropriate.',
      },
      {
        role: 'user',
        content: `
        The existing text is: ${prompt}
        Use the language: ${language.value}
        Return only the result of your task.
        `,
      },
    ])
    .with('fix', () => [
      {
        role: 'system',
        content:
          'You are an AI writing assistant that fixes grammar and spelling errors in existing text. ' +
          `You are writting a ${textFormat}` +
          'Limit your response to no more than 200 characters, but make sure to construct complete sentences.' +
          'Use Markdown formatting when appropriate.',
      },
      {
        role: 'user',
        content: `
        The existing text is: ${prompt}
        Use the language: ${language.value}
        Return only the result of your task.
        `,
      },
    ])
    .with('zap', () => [
      {
        role: 'system',
        content:
          'You area an AI writing assistant that generates text based on a prompt. ' +
          `You are writting a ${textFormat}` +
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
        Use the language: ${language.value}
        Return only the result of your task.`,
      },
    ])
    .with('command', () => [
      {
        role: 'system',
        content: systemGhostWritterPrompt(textFormat),
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
          Return only the result of your task.

        `,
      },
    ])
    .with('magic', () =>
      match(textFormat)
        .with('article', () => [
          {
            role: 'system',
            content: plannerAgentPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            The client wants to write a ${textFormat}

            using the following context:
            ${context}
            `,
          },
          {
            role: 'system',
            content: systemGhostWritterPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            act upon the previous plan and write the ${textFormat}

            using only the following context:
            ${context}

            output only the ${textFormat}
            `,
          },
          {
            role: 'system',
            content: translatorAgentPrompt(textFormat, language.value),
          },
          {
            role: 'user',
            content: `
            translate the previous ${textFormat} to ${language.value}:
            output only the translated result
            `,
          },
        ])
        .with('blog', () => [
          {
            role: 'system',
            content: plannerAgentPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            The client wants to write a ${textFormat}

            using the following context:
            ${context}
            `,
          },
          {
            role: 'system',
            content: systemGhostWritterPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            act upon the previous plan and write the ${textFormat}

            using only the following context:
            ${context}

            output only the ${textFormat}
            `,
          },
          {
            role: 'system',
            content: translatorAgentPrompt(textFormat, language.value),
          },
          {
            role: 'user',
            content: `
            translate the previous ${textFormat} to ${language.value}:
            output only the translated result
            `,
          },
        ])
        .with('tweet', () => [
          {
            role: 'system',
            content: plannerAgentPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            The client wants to write a ${textFormat}

            using the following context:
            ${context}
            `,
          },
          {
            role: 'system',
            content: systemGhostWritterPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            act upon the previous plan and write the ${textFormat}

            using only the following context:
            ${context}

            output only the ${textFormat}
            `,
          },
          {
            role: 'system',
            content: translatorAgentPrompt(textFormat, language.value),
          },
          {
            role: 'user',
            content: `
            translate the previous ${textFormat} to ${language.value}:
            output only the translated result
            `,
          },
        ])
        .with('email', () => [
          {
            role: 'system',
            content: plannerAgentPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            The client wants to write a ${textFormat}

            using the following context:
            ${context}
            `,
          },
          {
            role: 'system',
            content: systemGhostWritterPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            act upon the previous plan and write the ${textFormat}

            using only the following context:
            ${context}

            output only the ${textFormat}
            `,
          },
          {
            role: 'system',
            content: translatorAgentPrompt(textFormat, language.value),
          },
          {
            role: 'user',
            content: `
            translate the previous ${textFormat} to ${language.value}:
            output only the translated result
            `,
          },
        ])
        .with('newsletter', () => [
          {
            role: 'system',
            content: plannerAgentPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            The client wants to write a ${textFormat}

            using the following context:
            ${context}
            `,
          },
          {
            role: 'system',
            content: systemGhostWritterPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            act upon the previous plan and write the ${textFormat}

            using only the following context:
            ${context}

            output only the ${textFormat}
            `,
          },
          {
            role: 'system',
            content: translatorAgentPrompt(textFormat, language.value),
          },
          {
            role: 'user',
            content: `
            translate the previous ${textFormat} to ${language.value}:
            output only the translated result
            `,
          },
        ])
        .with('video-script', () => [
          {
            role: 'system',
            content: plannerAgentPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            The client wants to write a ${textFormat}

            using the following context:
            ${context}
            `,
          },
          {
            role: 'system',
            content: systemGhostWritterPrompt(textFormat),
          },
          {
            role: 'user',
            content: `
            act upon the previous plan and write the ${textFormat}

            using only the following context:
            ${context}

            output only the ${textFormat}
            `,
          },
          {
            role: 'system',
            content: translatorAgentPrompt(textFormat, language.value),
          },
          {
            role: 'user',
            content: `
            translate the previous ${textFormat} to ${language.value}:
            output only the translated result
            `,
          },
        ])
        .run(),
    )
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
