'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown, Loader2, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useOnborda } from 'onborda'
import { useEffect, useState } from 'react'

import { getOrganizations } from '@/http/get-organizations'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Skeleton } from './ui/skeleton'

export function OrganizationSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentStep, setCurrentStep } = useOnborda()
  const { slug: currentOrg } = useParams<{
    slug: string
  }>()

  const { data, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getOrganizations(),
  })

  const currentOrganization =
    data && data.organizations.find((org) => org.slug === currentOrg)

  useEffect(() => {
    console.log('currentStep', currentStep)
    if (currentStep === 1) {
      setIsOpen(true)
    }
  }, [currentStep])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex w-[168px] items-center gap-2 rounded p-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {isLoading ? (
          <>
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-full flex-1" />
          </>
        ) : (
          <>
            {currentOrganization ? (
              <>
                <Avatar className="mr-2 size-4">
                  {currentOrganization.avatarUrl && (
                    <AvatarImage src={currentOrganization.avatarUrl} />
                  )}
                  <AvatarFallback />
                </Avatar>
                <span className="truncate text-left">
                  {currentOrganization.name}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Select organization</span>
            )}
          </>
        )}
        {isLoading ? (
          <Loader2 className="ml-auto size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        alignOffset={-16}
        sideOffset={12}
        className="w-[200px]"
        id="onborda-step2"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {data &&
            data.organizations.map((organization) => {
              return (
                <DropdownMenuItem key={organization.id} asChild>
                  <Link href={`/org/${organization.slug}`}>
                    <Avatar className="mr-2 size-4">
                      {organization.avatarUrl && (
                        <AvatarImage src={organization.avatarUrl} />
                      )}
                      <AvatarFallback />
                    </Avatar>
                    <span className="line-clamp-1">{organization.name}</span>
                  </Link>
                </DropdownMenuItem>
              )
            })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/create-organization"
            onClick={() => setTimeout(() => setCurrentStep(2), 550)}
          >
            <PlusCircle className="mr-2 size-4" />
            Create new
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
