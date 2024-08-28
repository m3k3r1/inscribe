import Link from 'next/link'

import { SignInForm } from '@/app/(auth)/sign-in/sign-in-form'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  return (
    <div className="p-8">
      <Button variant="ghost" asChild className="absolute right-8 top-8">
        <Link href="landing">No account yet? Sign Up</Link>
      </Button>
      <div className="flex w-[350px] flex-col justify-center gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Unleash your content
          </h1>
          <p className="text-small text-muted-foreground">
            Creativity on steroids
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
