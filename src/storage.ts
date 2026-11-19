import { parseImportedFile } from './imports'
import type { Game } from './types'

const STORAGE_KEY = 'gametracker.games.v1'

export function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parseImportedFile(raw) : []
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
  return parseImportedFile(await file.text())
}
