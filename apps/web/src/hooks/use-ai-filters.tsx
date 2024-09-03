import { createContext, type ReactNode, useContext, useState } from 'react'

type AiFiltersContextProviderProps = {
  children: ReactNode
}

export interface SelectType {
  value: string
  label: string
  disabledOn?: boolean
}

export type AiFiltersContextDataProps = {
  datasetFilter: Set<SelectType>
  setDatasetFilter: (value: Set<SelectType>) => void
  formatFilter: Set<SelectType>
  setFormatFilter: (value: Set<SelectType>) => void
  languageFilter: Set<SelectType>
  setLanguageFilter: (value: Set<SelectType>) => void
  modelFilter: Set<SelectType>
  setModelFilter: (value: Set<SelectType>) => void
}

export const AuthContext = createContext<AiFiltersContextDataProps>(
  {} as AiFiltersContextDataProps,
)

export function AiFiltersContextProvider({
  children,
}: AiFiltersContextProviderProps) {
  const [datasetFilter, setDatasetFilter] = useState<Set<SelectType>>(new Set())
  const [formatFilter, setFormatFilter] = useState<Set<SelectType>>(new Set())
  const [languageFilter, setLanguageFilter] = useState<Set<SelectType>>(
    new Set(),
  )
  const [modelFilter, setModelFilter] = useState<Set<SelectType>>(new Set())

  return (
    <AuthContext.Provider
      value={{
        datasetFilter,
        setDatasetFilter,
        formatFilter,
        setFormatFilter,
        languageFilter,
        setLanguageFilter,
        modelFilter,
        setModelFilter,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAiFilters() {
  const context = useContext(AuthContext)

  return context
}
