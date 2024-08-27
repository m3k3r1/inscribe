import { api } from './api-client'

interface SignInOutput {
  messge: string
}

export async function signInWithMagicLink(
  email: string,
): Promise<SignInOutput> {
  return api.post('auth/link', { json: { email } }).json<SignInOutput>()
}
