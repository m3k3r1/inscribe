'use client'

import { AlertTriangle, FileText, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Icons } from '@/components/icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useFormState } from '@/hooks/use-form-state'
import { queryClient } from '@/lib/react-query'

import { uploadDataAction } from './action'

export default function UploadDataForm() {
  const { slug: orgSlug } = useParams<{ slug: string }>()
  const router = useRouter()

  const [{ errors, message, success }, handleSubmit, isPending] = useFormState(
    uploadDataAction,
    () => {
      queryClient.invalidateQueries({
        queryKey: [orgSlug, 'datasets'],
      })
      router.back()
    },
  )
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {success === false && message && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Failed loading data!</AlertTitle>
            <AlertDescription>
              <p>{message}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <RadioGroup
            name="type"
            id="type"
            defaultValue="YOUTUBE"
            className="grid grid-cols-3 gap-2"
          >
            <div>
              <RadioGroupItem
                value="YOUTUBE"
                id="youtube"
                className="peer sr-only"
              />
              <Label
                htmlFor="youtube"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 text-xs hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.youtube className="mb-3 h-6 w-6" />
                Youtube
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="notion"
                id="notion"
                className="peer sr-only"
                disabled
              />
              <Label
                htmlFor="notion"
                className="flex flex-col items-center  justify-between rounded-md border-2 border-muted bg-popover p-2 text-xs hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.notion className="mb-3 h-6 w-6" />
                Notion
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="pdf"
                id="pdf"
                className="peer sr-only"
                disabled
              />
              <Label
                htmlFor="pdf"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 text-xs hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <FileText className="mb-3 h-6 w-6" />
                PDF
              </Label>
            </div>
          </RadioGroup>

          {errors?.name && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors.type[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="url">Url</Label>
          <Input name="url" id="name" />

          {errors?.name && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors.name[0]}
            </p>
          )}
        </div>

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Upload Data'
          )}
        </Button>
      </form>
    </div>
  )
}
