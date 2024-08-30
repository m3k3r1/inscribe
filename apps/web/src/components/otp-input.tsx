'use client'
import { uiEnv as env } from '@saas/env'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from './ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './ui/input-otp'

export function OtpInput() {
  const [value, setValue] = useState('')

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <InputOTP
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        maxLength={6}
        onChange={setValue}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <Button asChild>
        <Link
          href={`${env.NEXT_PUBLIC_API_URL}/auth/link/authenticate?code=${value}&redirect=${env.NEXT_PUBLIC_APP_URL}/home`}
        >
          Enter
        </Link>
      </Button>
    </div>
  )
}
