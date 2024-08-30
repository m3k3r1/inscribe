import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { UsageChart } from '@/components/usage-chart'
import { getProfile } from '@/http/get-profile'
import { getUsage } from '@/http/get-usage'

dayjs.extend(relativeTime)

export async function BillingList() {
  const usage = await getUsage()
  const { user } = await getProfile()

  const usageByProject = usage.usage.reduce(
    (acc, curr) => {
      if (!acc[curr.project.id]) {
        acc[curr.project.id] = {
          ...curr.project,
          totalTokens: 0,
          orgName: curr.project.organization.name,
          orgSlug: curr.project.organization.slug,
          createdAt: curr.createdAt,
        }
      }
      acc[curr.project.id].totalTokens += curr.totalTokens
      return acc
    },
    {} as Record<
      string,
      {
        id: string
        name: string
        slug: string
        orgName: string
        orgSlug: string
        totalTokens: number
        createdAt: string
      }
    >,
  )

  const absoluteToken = usage.usage.reduce((acc, curr) => {
    acc += curr.totalTokens
    return acc
  }, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Progress
          className="flex-1"
          value={(absoluteToken / user.tokenLimit) * 100}
        />
        <span className="text-right text-sm text-muted-foreground">
          {absoluteToken.toLocaleString()} / {user.tokenLimit}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Object.values(usageByProject).map((project) => (
          <Card key={project.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl font-medium">
                {project.orgName}/{project.name}
              </CardTitle>
            </CardHeader>
            <UsageChart project={project} maxTokens={user.tokenLimit} />
            <CardFooter className="flex items-center justify-end gap-1.5">
              <span className="truncate text-xs text-muted-foreground">
                edited {dayjs(project.createdAt).fromNow()}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
