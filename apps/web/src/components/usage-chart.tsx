'use client'

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts'

import { ChartConfig, ChartContainer } from '@/components/ui/chart'

import { CardContent } from './ui/card'

const chartConfig = {
  tokens: {
    label: 'tokens',
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

interface UsageChartProps {
  project: {
    name: string
    totalTokens: number
  }
  maxTokens: number
}

export function UsageChart({ project, maxTokens }: UsageChartProps) {
  const percentage = (project.totalTokens / maxTokens) * 100
  const endAngle = 360 * (percentage / 100)

  const chartData = [
    {
      browser: 'safari',
      tokens: percentage,
      fill: 'var(--color-safari)',
    },
  ]

  return (
    <CardContent>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[150px]" // Reduced max height
      >
        <RadialBarChart
          data={chartData}
          startAngle={0}
          innerRadius={60} // Reduced inner radius
          outerRadius={80} // Reduced outer radius
          endAngle={endAngle}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted last:fill-background"
            polarRadius={[65, 55]} // Adjusted polar radius
          />
          <RadialBar dataKey="tokens" background cornerRadius={8} />{' '}
          {/* Reduced corner radius */}
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-xl font-bold" // Reduced font size
                      >
                        {project.totalTokens.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 20} // Reduced vertical spacing
                        className="fill-muted-foreground text-sm" // Reduced font size
                      >
                        Tokens
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </CardContent>
  )
}
