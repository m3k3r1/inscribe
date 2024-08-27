import { api } from './api-client'

interface SendFeedbackOutput {
  message: string
}

interface SendFeedbackInput {
  content: string
}

export async function sendFeedback({
  content,
}: SendFeedbackInput): Promise<SendFeedbackOutput> {
  const result = await api
    .post('feedback', { json: { content } })
    .json<SendFeedbackOutput>()

  return result
}
