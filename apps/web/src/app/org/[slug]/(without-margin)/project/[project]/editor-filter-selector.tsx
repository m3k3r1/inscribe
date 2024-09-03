import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import type { SelectType } from '@/hooks/use-ai-filters'
import { cn } from '@/lib/utils'

interface EditorFilterSelectorProps {
  name: string
  selectedValues: Set<SelectType>
  onValueSelect: (value: Set<SelectType>) => void
  options: {
    label: string
    value: string
    disabledOn?: boolean
  }[]
  multiSelect?: boolean
  disabledOn?: boolean
}

export function EditorFilterSelector({
  name,
  options,
  selectedValues,
  onValueSelect,
  multiSelect = false,
  disabledOn = false,
}: EditorFilterSelectorProps) {
  function isSelected(option: SelectType) {
    return Array.from(selectedValues).some(
      (selected) => selected.value === option.value,
    )
  }

  function handleSelect(option: SelectType) {
    const newSelectedValues = new Set(selectedValues)

    if (multiSelect) {
      if (isSelected(option)) {
        newSelectedValues.forEach((value) => {
          if (value.value === option.value) {
            newSelectedValues.delete(value)
          }
        })
      } else {
        newSelectedValues.add(option)
      }
    } else {
      newSelectedValues.clear()
      newSelectedValues.add(option)
    }

    onValueSelect(newSelectedValues)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {name}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  Array.from(selectedValues).map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={'Search ...'} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => {
                const selected = isSelected(option)
                return (
                  <CommandItem
                    disabled={disabledOn && option.disabledOn}
                    key={option.value}
                    onSelect={() => handleSelect(option)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4')} />
                    </div>
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onValueSelect(new Set())
                    }}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
