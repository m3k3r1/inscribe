'use client'

import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useParams } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getProjects } from '@/http/get-projects'

import { ProjectLink } from './project-link'

dayjs.extend(relativeTime)

export function ProjectList() {
  const { slug: orgSlug } = useParams<{
    slug: string
    project: string
  }>()

  const { data: projects, isLoading } = useQuery({
    queryKey: [orgSlug, 'projects'],
    queryFn: () => getProjects(orgSlug),
    enabled: !!orgSlug,
  })

  return (
    <div className="grid grid-cols-3 gap-4">
      {isLoading && (
        <>
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-full flex-1" />
        </>
      )}
      {projects &&
        projects.projects.map((project) => {
          return (
            <Card key={project.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-xl font-medium">
                  {project.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 leading-relaxed">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center gap-1.5">
                <Avatar className="size-4">
                  {project.owner.avatarUrl && (
                    <AvatarImage src={project.owner.avatarUrl} />
                  )}
                  <AvatarFallback />
                </Avatar>
                <span className="truncate text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {project.owner.name}
                  </span>{' '}
                  {dayjs(project.createdAt).fromNow()}
                </span>
                <ProjectLink projectSlug={project.slug} />
              </CardFooter>
            </Card>
          )
        })}
    </div>
  )
}
