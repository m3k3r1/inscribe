import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const redirectUrl = new URL(request.nextUrl.clone())
  redirectUrl.pathname = '/'
  cookies().delete('token')
  return NextResponse.redirect(redirectUrl)
}
