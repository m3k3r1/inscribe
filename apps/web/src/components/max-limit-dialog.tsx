'use client'

import { useParams, useRouter } from 'next/navigation'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'

export function MaxLimitDialog() {
  const { slug: orgSlug } = useParams<{
    slug: string
  }>()
  const router = useRouter()

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Token limit reached</AlertDialogTitle>
          <AlertDialogDescription>
            You have reached your token limit. Please upgrade your plan to
            continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => router.back()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              router.push(`/org/${orgSlug}/billing`)
            }}
          >
            Upgrade
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
