import { api } from './api-client'

interface TokenUsageInput {
  totalTokens: number
  promptTokens: number
  completionTokens: number
}

export async function updateTokenUsage(
  organizationSlug: string,
  projectSlug: string,
  { totalTokens, promptTokens, completionTokens }: TokenUsageInput,
): Promise<void> {
  return await api
    .patch(`organization/${organizationSlug}/project/${projectSlug}/usage`, {
      json: { totalTokens, promptTokens, completionTokens },
    })
    .json()
}
