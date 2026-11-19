import { describe, expect, it } from 'vitest'
import { parseImportedFile } from './index'

describe('parseImportedFile', () => {
  it('importa la respuesta GetOwnedGames de Steam', () => {
    const games = parseImportedFile(
      JSON.stringify({
        response: {
          game_count: 2,
          games: [
            {
              appid: 367520,
              name: 'Hollow Knight',
              playtime_forever: 3120,
              playtime_2weeks: 0,
            },
            {
              appid: 1091500,
              name: 'Cyberpunk 2077',
              playtime_forever: 90,
              playtime_2weeks: 30,
            },
          ],
        },
      }),
    )

    expect(games).toHaveLength(2)
    expect(games[0]).toMatchObject({
      id: 'steam-367520',
      title: 'Hollow Knight',
      platform: 'steam',
      status: 'backlog',
      hours: 52,
      rating: 0,
    })
    expect(games[1]).toMatchObject({
      id: 'steam-1091500',
      status: 'playing',
      hours: 1.5,
    })
  })

  it('acepta un array directo de juegos de Steam y deduplica por appid', () => {
    const games = parseImportedFile(
      JSON.stringify([
        { appid: 10, name: 'Juego', playtime_forever: 60 },
        { appid: 10, name: 'Juego', playtime_forever: 120 },
      ]),
    )

    expect(games).toHaveLength(1)
    expect(games[0].hours).toBe(2)
  })

  it('importa una copia de GameTracker', () => {
    const games = parseImportedFile(
      JSON.stringify({
        version: 1,
        games: [
          {
            id: 'abc',
            title: 'Juego',
            platform: 'epic',
            status: 'completed',
            hours: 3,
            rating: 4,
            notes: 'Nota',
          },
        ],
      }),
    )

    expect(games[0]).toMatchObject({
      id: 'abc',
      title: 'Juego',
      platform: 'epic',
      status: 'completed',
      hours: 3,
      rating: 4,
      notes: 'Nota',
    })
  })

  it('rechaza JSON inválido', () => {
    expect(() => parseImportedFile('no es json')).toThrow(
      'El archivo no contiene JSON válido.',
    )
  })

  it('rechaza formatos desconocidos', () => {
    expect(() => parseImportedFile('{"foo":1}')).toThrow(
      'El archivo no contiene una lista de juegos.',
    )
  })

  it('rechaza una biblioteca de Steam vacía', () => {
    expect(() =>
      parseImportedFile(JSON.stringify({ response: { games: [] } })),
    ).toThrow('No se encontraron juegos válidos en el archivo de Steam.')
  })
})
