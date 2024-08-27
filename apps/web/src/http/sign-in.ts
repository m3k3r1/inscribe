import { api } from './api-client'

interface SignInInput {
  email: string
  password: string
}

interface SignInOutput {
  token: string
}

export async function signIn({
  email,
  password,
}: SignInInput): Promise<SignInOutput> {
  const result = await api
    .post('auth', { json: { email, password } })
    .json<SignInOutput>()

  return result
}
