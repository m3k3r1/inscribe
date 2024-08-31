'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Editor } from '@/components/editor/editor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useAiFilters } from '@/hooks/use-ai-filters'
import { getContent } from '@/http/get-content'
import { getDatasets } from '@/http/get-datasets'

import { DraggableDatasetBlock } from './draggable-dataset-block'
import { EditorFilterSelector } from './editor-filter-selector'

const models = [
  {
    value: 'gpt-4o',
    label: 'OpenAI - gpt4o',
  },
  {
    value: 'gpt-4o-mini',
    label: 'OpenAI - gpt4 mini',
  },
  {
    value: 'claude-3-5-sonnet-20240620',
    label: 'Anthropic - Claude 3.5 Sonnet',
  },
  {
    value: 'mistral-large-latest',
    label: 'Mistral - Large',
  },
]

const formats = [
  {
    value: 'tweet',
    label: 'Tweet',
  },
  {
    value: 'blog',
    label: 'Blog',
  },
  {
    value: 'video-script',
    label: 'Video Script',
  },
  {
    value: 'email',
    label: 'Email',
  },
  {
    value: 'newsletter',
    label: 'Newsletter',
  },
]

const languages = [
  {
    value: 'Portuguese from portugal',
    label: 'Portuguese',
  },
  {
    value: 'german',
    label: 'German',
  },
  {
    value: 'french',
    label: 'French',
  },
  {
    value: 'spanish',
    label: 'Spanish',
  },
  {
    value: 'english',
    label: 'English',
  },
]

export default function Projects() {
  const {
    modelFilter,
    setModelFilter,
    datasetFilter,
    setDatasetFilter,
    formatFilter,
    setFormatFilter,
    languageFilter,
    setLanguageFilter,
  } = useAiFilters()
  const { slug: orgSlug, project: projectSlug } = useParams<{
    slug: string
    project: string
  }>()

  const [charsCount, setCharsCount] = useState(0)
  const [saveStatus, setSaveStatus] = useState('Saved')
  const [search, setSearch] = useState('')
  const [liveSearch, setLiveSearch] = useState(false)

  const [currentContent, setCurrentContent] = useState<string>('')

  const { data: datasetsData } = useQuery({
    queryKey: [orgSlug, 'datasets'],
    queryFn: () => getDatasets(orgSlug!),
    enabled: !!orgSlug,
  })

  const { data: projectContent } = useQuery({
    queryKey: [orgSlug, 'datasets', 'project', projectSlug],
    queryFn: () => getContent(orgSlug!, projectSlug!),
    enabled: !!orgSlug && !!projectSlug,
  })

  const datasets =
    datasetsData?.datasets.map((dataset) => ({
      value: dataset.id,
      label: dataset.name,
    })) || []

  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
            {saveStatus}
          </div>
          <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
            {charsCount} Words
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <EditorFilterSelector
            name="Datasets"
            options={datasets}
            selectedValues={datasetFilter}
            onValueSelect={setDatasetFilter}
            multiSelect
          />

          <EditorFilterSelector
            name="Format"
            options={formats}
            selectedValues={formatFilter}
            onValueSelect={setFormatFilter}
          />

          <EditorFilterSelector
            name="Language"
            options={languages}
            selectedValues={languageFilter}
            onValueSelect={setLanguageFilter}
          />

          <EditorFilterSelector
            name="Model"
            options={models}
            selectedValues={modelFilter}
            onValueSelect={setModelFilter}
          />
        </div>
      </div>

      <div className="flex h-full gap-2">
        <Editor
          setCharsCount={setCharsCount}
          setSaveStatus={setSaveStatus}
          content={projectContent?.content}
          onContentChange={setCurrentContent}
        />
        <div className="flex w-1/3 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              className="flex-1"
              disabled={liveSearch}
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-col items-center gap-1">
              <Label className="text-xs">Live Search</Label>
              <Switch checked={liveSearch} onCheckedChange={setLiveSearch} />
            </div>
          </div>
          <ScrollArea className="h-[80vh] ">
            <DraggableDatasetBlock
              datasetFilter={datasetFilter}
              search={search}
              liveSearch={liveSearch}
              projectContent={currentContent as string}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
