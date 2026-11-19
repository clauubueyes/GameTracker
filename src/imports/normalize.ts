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

function textField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function dateField(value: unknown): string {
  const text = textField(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return ''

  const date = new Date(`${text}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text
    ? text
    : ''
}

function tagsField(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const tags = new Map<string, string>()
  for (const tag of value) {
    if (typeof tag !== 'string') continue
    const trimmed = tag.trim()
    if (!trimmed) continue

    const key = trimmed.toLocaleLowerCase()
    if (!tags.has(key)) tags.set(key, trimmed)
  }

  return [...tags.values()]
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
    originalPlatform: textField(value.originalPlatform),
    purchaseDate: dateField(value.purchaseDate),
    tags: tagsField(value.tags),
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
