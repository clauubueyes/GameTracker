import type { Game, Platform, Status } from './types'

export type SortKey = 'updated' | 'title' | 'hours'

export interface FilterOptions {
  search: string
  platform: Platform | 'all'
  status: Status | 'all'
  tag: string
  year: string
  sort: SortKey
}

export function getAvailableTags(games: Game[]): string[] {
  const tags = new Set<string>()

  for (const game of games) {
    for (const tag of game.tags) tags.add(tag)
  }

  return [...tags].sort((a, b) => a.localeCompare(b))
}

export function getAvailableYears(games: Game[]): string[] {
  const years = new Set<string>()

  for (const game of games) {
    if (game.purchaseDate) years.add(game.purchaseDate.slice(0, 4))
  }

  return [...years].sort((a, b) => b.localeCompare(a))
}

export function filterAndSortGames(
  games: Game[],
  options: FilterOptions,
): Game[] {
  const term = options.search.trim().toLocaleLowerCase()
  const tag = options.tag.toLocaleLowerCase()

  const filtered = games.filter((game) => {
    const searchableText = [
      game.title,
      game.notes,
      game.originalPlatform,
      ...game.tags,
    ]
      .join(' ')
      .toLocaleLowerCase()

    const matchesSearch = !term || searchableText.includes(term)
    const matchesPlatform =
      options.platform === 'all' || game.platform === options.platform
    const matchesStatus = options.status === 'all' || game.status === options.status
    const matchesTag =
      !tag || game.tags.some((gameTag) => gameTag.toLocaleLowerCase() === tag)
    const matchesYear = !options.year || game.purchaseDate.startsWith(options.year)

    return (
      matchesSearch && matchesPlatform && matchesStatus && matchesTag && matchesYear
    )
  })

  return filtered.sort((a, b) => {
    if (options.sort === 'title') return a.title.localeCompare(b.title)
    if (options.sort === 'hours') return b.hours - a.hours
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}
