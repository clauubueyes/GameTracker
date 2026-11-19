import {
  PLATFORMS,
  STATUSES,
  type Game,
  type Platform,
  type Status,
} from '../types'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeGame(value: unknown): Game | null {
  if (!isRecord(value)) return null

  const title = typeof value.title === 'string' ? value.title.trim() : ''
  if (!title) return null

  const platform = PLATFORMS.includes(value.platform as Platform)
    ? (value.platform as Platform)
    : 'other'
  const status = STATUSES.includes(value.status as Status)
    ? (value.status as Status)
    : 'backlog'
  const hours =
    typeof value.hours === 'number' && Number.isFinite(value.hours)
      ? Math.max(0, value.hours)
      : 0
  const rating =
    typeof value.rating === 'number' && Number.isFinite(value.rating)
      ? Math.min(5, Math.max(0, Math.round(value.rating)))
      : 0
  const now = new Date().toISOString()

  return {
    id: typeof value.id === 'string' && value.id ? value.id : crypto.randomUUID(),
    title,
    platform,
    status,
    hours,
    rating,
    notes: typeof value.notes === 'string' ? value.notes : '',
    addedAt: typeof value.addedAt === 'string' ? value.addedAt : now,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : now,
  }
}

export function normalizeGameList(value: unknown): Game[] {
  const source = isRecord(value) && 'games' in value ? value.games : value

  if (!Array.isArray(source)) {
    throw new Error('El archivo no contiene una lista de juegos.')
  }

  return source
    .map(normalizeGame)
    .filter((game): game is Game => game !== null)
}
