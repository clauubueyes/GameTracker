export const PLATFORMS = ['steam', 'epic', 'emulator', 'other'] as const
export type Platform = (typeof PLATFORMS)[number]

export const STATUSES = ['playing', 'completed', 'backlog', 'dropped'] as const
export type Status = (typeof STATUSES)[number]

export interface Game {
  id: string
  title: string
  platform: Platform
  status: Status
  hours: number
  rating: number
  notes: string
  addedAt: string
  updatedAt: string
}

export type GameDraft = Pick<
  Game,
  'title' | 'platform' | 'status' | 'hours' | 'rating' | 'notes'
>

export const PLATFORM_LABELS: Record<Platform, string> = {
  steam: 'Steam',
  epic: 'Epic Games',
  emulator: 'Emulador',
  other: 'Otro',
}

export const STATUS_LABELS: Record<Status, string> = {
  playing: 'Jugando',
  completed: 'Completado',
  backlog: 'Pendiente',
  dropped: 'Abandonado',
}

export const EMPTY_DRAFT: GameDraft = {
  title: '',
  platform: 'steam',
  status: 'backlog',
  hours: 0,
  rating: 0,
  notes: '',
}
