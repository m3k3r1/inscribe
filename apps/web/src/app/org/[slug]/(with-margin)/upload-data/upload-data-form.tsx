'use client'

import { AlertTriangle, File, FileText, Loader2, Upload, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

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
  const [data, setData] = useState('YOUTUBE')

  const [{ errors, message, success }, handleSubmit, isPending] = useFormState(
    uploadDataAction,
    () => {
      queryClient.invalidateQueries({
        queryKey: [orgSlug, 'datasets'],
      })
      router.back()
    },
  )

  const [filename, setFilename] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      setFilename(file.name)
    }
  }

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      setFile(droppedFiles[0])
      setFilename(droppedFiles[0].name)
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(droppedFiles[0])
        fileInput.files = dataTransfer.files
      }
    }
  }, [])

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
            onValueChange={(value) => {
              setData(value)
            }}
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
                value="NOTION"
                id="NOTION"
                className="peer sr-only"
                disabled
              />
              <Label
                htmlFor="NOTION"
                className="flex flex-col items-center  justify-between rounded-md border-2 border-muted bg-popover p-2 text-xs hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.notion className="mb-3 h-6 w-6" />
                Notion
              </Label>
            </div>
            <div>
              <RadioGroupItem value="PDF" id="PDF" className="peer sr-only" />
              <Label
                htmlFor="PDF"
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

        {data === 'YOUTUBE' && (
          <div className="space-y-1">
            <Label htmlFor="url">Url</Label>
            <Input name="url" id="name" />

            {errors?.name && (
              <p className="text-xs font-medium text-red-500 dark:text-red-400">
                {errors.name[0]}
              </p>
            )}
          </div>
        )}

        {data === 'PDF' && (
          <div className="mx-auto w-full max-w-md">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              hidden={!!file}
              className={`rounded-lg border-2 border-dashed p-8 text-center ${
                isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
              }`}
            >
              <Input
                id="file"
                name="file"
                type="file"
                onChange={onFileChange}
                className="hidden"
              />
              <Label htmlFor="file" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Drag and drop files here, or click to select files
                </p>
              </Label>
            </div>
          </div>
        )}

        {file && (
          <ul className="mt-4 space-y-2">
            <li className="flex items-center justify-between rounded bg-gray-100 p-2">
              <div className="flex items-center">
                <File className="mr-2 h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{filename}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                // onClick={removeFile}
                aria-label={`Remove ${filename}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          </ul>
        )}

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
