import type { Game } from '../types'
import { isRecord } from './normalize'

interface SteamGameRecord extends Record<string, unknown> {
  appid: number | string
  name: string
}

function isSteamGame(value: unknown): value is SteamGameRecord {
  if (!isRecord(value)) return false
  if (typeof value.name !== 'string') return false

  const appid = value.appid
  return (
    (typeof appid === 'number' && Number.isFinite(appid)) ||
    (typeof appid === 'string' && appid.trim().length > 0)
  )
}

function nonNegativeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : 0
}

export function extractSteamGames(value: unknown): unknown[] | null {
  if (
    isRecord(value) &&
    isRecord(value.response) &&
    Array.isArray(value.response.games)
  ) {
    return value.response.games
  }

  if (Array.isArray(value) && value.length > 0 && value.every(isSteamGame)) {
    return value
  }

  return null
}

function toGame(value: unknown): Game | null {
  if (!isSteamGame(value)) return null

  const appid = String(value.appid).trim()
  const title = value.name.trim()
  if (!appid || !title) return null

  const playtimeForever = nonNegativeNumber(value.playtime_forever)
  const playtimeRecent = nonNegativeNumber(value.playtime_2weeks)
  const now = new Date().toISOString()

  return {
    id: `steam-${appid}`,
    title,
    platform: 'steam',
    status: playtimeRecent > 0 ? 'playing' : 'backlog',
    hours: Math.round((playtimeForever / 60) * 10) / 10,
    rating: 0,
    notes: '',
    originalPlatform: 'PC',
    purchaseDate: '',
    tags: [],
    addedAt: now,
    updatedAt: now,
  }
}

export function parseSteamLibrary(value: unknown): Game[] {
  const source = extractSteamGames(value)

  if (!source) {
    throw new Error(
      'No se reconoció el formato de Steam: se espera { "response": { "games": [...] } }.',
    )
  }

  const byId = new Map<string, Game>()
  for (const entry of source) {
    const game = toGame(entry)
    if (game) byId.set(game.id, game)
  }

  if (byId.size === 0) {
    throw new Error('No se encontraron juegos válidos en el archivo de Steam.')
  }

  return [...byId.values()]
}
