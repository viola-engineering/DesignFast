import { get } from './client'

export interface AppConfig {
  byokEnabled: boolean
  githubUrl: string
}

export async function getConfig(): Promise<AppConfig> {
  return get<AppConfig>('/api/config')
}
