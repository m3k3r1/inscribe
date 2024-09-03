import { api } from './api-client'

export async function deleteDataset(
  org: string,
  dataset: string,
): Promise<void> {
  return await api.delete(`organization/${org}/dataset/${dataset}`).json()
}
