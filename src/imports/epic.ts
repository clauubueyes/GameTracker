import type { Game } from '../types'
import { isRecord } from './normalize'

function textField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isEpicItem(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false

  const appName = textField(value.AppName)
  const catalogItemId = textField(value.CatalogItemId)
  if (!appName && !catalogItemId) return false

  return Boolean(textField(value.DisplayName) || appName)
}

export function extractEpicItems(value: unknown): Record<string, unknown>[] | null {
  if (isEpicItem(value)) return [value]

  if (Array.isArray(value) && value.length > 0 && value.every(isEpicItem)) {
    return value
  }

  return null
}

function toGame(item: Record<string, unknown>): Game | null {
  if (item.bIsIncompleteInstall === true) return null
  if (item.bIsApplication === false) return null
  if (item.bIsExecutable === false) return null

  const appName = textField(item.AppName)
  const title = textField(item.DisplayName) || appName
  const identity = textField(item.CatalogItemId) || appName
  if (!title || !identity) return null

  const now = new Date().toISOString()

  return {
    id: `epic-${identity}`,
    title,
    platform: 'epic',
    status: 'backlog',
    hours: 0,
    rating: 0,
    notes: '',
    originalPlatform: 'PC',
    purchaseDate: '',
    tags: [],
    addedAt: now,
    updatedAt: now,
  }
}

export function parseEpicLibrary(items: Record<string, unknown>[]): Game[] {
  const byId = new Map<string, Game>()

  for (const item of items) {
    const game = toGame(item)
    if (game) byId.set(game.id, game)
  }

  if (byId.size === 0) {
    throw new Error('No se encontraron juegos válidos en los archivos de Epic.')
  }

  return [...byId.values()]
}
