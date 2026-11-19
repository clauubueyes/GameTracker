import type { Game } from '../types'
import { normalizeGameList } from './normalize'
import { extractSteamGames, parseSteamLibrary } from './steam'

export function parseImportedFile(text: string): Game[] {
  let value: unknown

  try {
    value = JSON.parse(text) as unknown
  } catch {
    throw new Error('El archivo no contiene JSON válido.')
  }

  return extractSteamGames(value) ? parseSteamLibrary(value) : normalizeGameList(value)
}
