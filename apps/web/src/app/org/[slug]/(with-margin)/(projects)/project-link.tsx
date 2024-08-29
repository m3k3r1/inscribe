'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface ProjectCardProps {
  projectSlug: string
}

export function ProjectLink({ projectSlug }: ProjectCardProps) {
  const { slug: orgSlug } = useParams<{
    slug: string
    project: string
  }>()

  return (
    <Button size="xs" variant="outline" className="ml-auto" asChild>
      <Link href={`/org/${orgSlug}/project/${projectSlug}`}>
        View <ArrowRight className="ml-2 size-3" />
      </Link>
    </Button>
  )
}
