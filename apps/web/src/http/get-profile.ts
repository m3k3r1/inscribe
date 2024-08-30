import { api } from './api-client'

interface GetProfileResponse {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    subscription: string | null
    tokenLimit: number
  }
}

export async function getProfile() {
  const result = await api.get('user/me').json<GetProfileResponse>()
  return result
}
