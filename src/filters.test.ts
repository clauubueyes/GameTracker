import { describe, expect, it } from 'vitest'
import {
  filterAndSortGames,
  getAvailableTags,
  getAvailableYears,
  type FilterOptions,
} from './filters'
import type { Game } from './types'

const baseGame: Game = {
  id: 'base',
  title: 'Juego base',
  platform: 'steam',
  status: 'backlog',
  hours: 0,
  rating: 0,
  notes: '',
  originalPlatform: '',
  purchaseDate: '',
  tags: [],
  addedAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

function game(overrides: Partial<Game>): Game {
  return { ...baseGame, ...overrides }
}

const defaultOptions: FilterOptions = {
  search: '',
  platform: 'all',
  status: 'all',
  tag: '',
  year: '',
  sort: 'updated',
}

describe('filterAndSortGames', () => {
  const games = [
    game({
      id: 'a',
      title: 'Hollow Knight',
      notes: 'Metroidvania',
      tags: ['Retro'],
      originalPlatform: 'Switch',
      purchaseDate: '2023-05-10',
      hours: 30,
      updatedAt: '2024-03-01T00:00:00Z',
    }),
    game({
      id: 'b',
      title: 'Cyberpunk 2077',
      platform: 'epic',
      status: 'completed',
      tags: ['RPG'],
      purchaseDate: '2024-11-20',
      hours: 80,
      updatedAt: '2024-05-01T00:00:00Z',
    }),
    game({ id: 'c', title: 'Zelda', platform: 'epic', tags: ['retro'] }),
  ]

  it('busca en título, notas, etiquetas y plataforma original', () => {
    expect(
      filterAndSortGames(games, { ...defaultOptions, search: 'METROID' }).map(
        (item) => item.id,
      ),
    ).toEqual(['a'])
    expect(
      filterAndSortGames(games, { ...defaultOptions, search: 'retro' }).map(
        (item) => item.id,
      ),
    ).toEqual(['a', 'c'])
    expect(
      filterAndSortGames(games, { ...defaultOptions, search: 'switch' }).map(
        (item) => item.id,
      ),
    ).toEqual(['a'])
  })

  it('filtra por etiqueta sin distinguir mayúsculas', () => {
    expect(
      filterAndSortGames(games, { ...defaultOptions, tag: 'RETRO' }).map(
        (item) => item.id,
      ),
    ).toEqual(['a', 'c'])
  })

  it('filtra por año de compra y combina filtros', () => {
    expect(
      filterAndSortGames(games, { ...defaultOptions, year: '2024' }).map(
        (item) => item.id,
      ),
    ).toEqual(['b'])
    expect(
      filterAndSortGames(games, {
        ...defaultOptions,
        platform: 'steam',
        status: 'backlog',
        tag: 'retro',
      }).map((item) => item.id),
    ).toEqual(['a'])
  })

  it('ordena por horas, título y fecha de actualización', () => {
    expect(
      filterAndSortGames(games, { ...defaultOptions, sort: 'hours' }).map(
        (item) => item.id,
      ),
    ).toEqual(['b', 'a', 'c'])
    expect(
      filterAndSortGames(games, { ...defaultOptions, sort: 'title' }).map(
        (item) => item.id,
      ),
    ).toEqual(['b', 'a', 'c'])
    expect(
      filterAndSortGames(games, defaultOptions).map((item) => item.id),
    ).toEqual(['b', 'a', 'c'])
  })
})

describe('opciones disponibles', () => {
  it('devuelve etiquetas únicas ordenadas y años descendentes', () => {
    const games = [
      game({ tags: ['RPG', 'retro'], purchaseDate: '2022-01-01' }),
      game({ tags: ['retro'], purchaseDate: '2024-06-01' }),
      game({ purchaseDate: '' }),
    ]

    expect(getAvailableTags(games)).toEqual(['retro', 'RPG'])
    expect(getAvailableYears(games)).toEqual(['2024', '2022'])
  })
})
