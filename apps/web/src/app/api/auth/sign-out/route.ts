import { uiEnv } from '@saas/env'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  cookies().delete('token')
  return NextResponse.redirect(uiEnv.NEXT_PUBLIC_APP_URL)
}
