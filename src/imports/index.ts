import type { Game } from '../types'
import { extractEpicItems, parseEpicLibrary } from './epic'
import { normalizeGameList } from './normalize'
import { extractSteamGames, parseSteamLibrary } from './steam'

export function parseImportedFile(text: string): Game[] {
  let value: unknown

  try {
    value = JSON.parse(text) as unknown
  } catch {
    throw new Error('El archivo no contiene JSON válido.')
  }

  if (extractSteamGames(value)) return parseSteamLibrary(value)

  const epicItems = extractEpicItems(value)
  if (epicItems) return parseEpicLibrary(epicItems)

  return normalizeGameList(value)
}

export function parseImportedFiles(texts: string[]): Game[] {
  const byId = new Map<string, Game>()

  for (const text of texts) {
    for (const game of parseImportedFile(text)) {
      byId.set(game.id, game)
    }
  }

  return [...byId.values()]
}
