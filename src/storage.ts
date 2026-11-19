import {
  PLATFORMS,
  STATUSES,
  type Game,
  type Platform,
  type Status,
} from './types'

const STORAGE_KEY = 'gametracker.games.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeGame(value: unknown): Game | null {
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

function parseGames(value: unknown): Game[] {
  if (!Array.isArray(value)) return []
  return value
    .map(normalizeGame)
    .filter((game): game is Game => game !== null)
}

export function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parseGames(JSON.parse(raw) as unknown) : []
  } catch {
    return []
  }
}

export function saveGames(games: Game[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
  } catch {
    return
  }
}

export function exportGames(games: Game[]): void {
  const blob = new Blob([JSON.stringify({ version: 1, games }, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gametracker-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function importGames(file: File): Promise<Game[]> {
  const parsed: unknown = JSON.parse(await file.text())
  const games = isRecord(parsed) && 'games' in parsed ? parsed.games : parsed

  if (!Array.isArray(games)) {
    throw new Error('El archivo no contiene una lista de juegos.')
  }

  return parseGames(games)
}
