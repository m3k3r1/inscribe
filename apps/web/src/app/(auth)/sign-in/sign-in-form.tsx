'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormState } from '@/hooks/use-form-state'

import { singInAction } from './actions'

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [{ errors, message, success }, handleSubmit, isPending] = useFormState(
    singInAction,
    () => {
      router.push('/sign-in/code')
      toast.success('We sent a authentication link to your email')
    },
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success === false && message && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Sign in failed!</AlertTitle>
          <AlertDescription>
            <p>{message}</p>
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email"> Email </Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={searchParams.get('email') ?? ''}
        />
        {errors?.email && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {errors.email[0]}
          </p>
        )}
      </div>

      <Button disabled={isPending} className="w-full" type="submit">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Sign In'}
      </Button>
    </form>
  )
}
