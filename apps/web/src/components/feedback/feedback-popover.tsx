'use client'

import { AlertTriangle, Loader2, MessageCircleQuestion } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useFormState } from '@/hooks/use-form-state'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Textarea } from '../ui/textarea'
import { sendFeedbackAction } from './actions'

export function FeedbackPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [{ errors, message, success }, handleSubmit, isPending] = useFormState(
    sendFeedbackAction,
    () => {
      toast.success('Feedback sent!')
      setIsOpen(false)
    },
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <MessageCircleQuestion className="size-4" />
          <span className="sr-only">Give Feedback</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {success === false && message && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Feedback failed</AlertTitle>
              <AlertDescription>
                <p>{message}</p>
              </AlertDescription>
            </Alert>
          )}
          <Label htmlFor="email"> Feedback </Label>
          <Textarea
            id="content"
            name="content"
            placeholder="Type your feedback here."
          />
          {errors?.content && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors.content[0]}
            </p>
          )}

          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              ' Send Feedback'
            )}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
