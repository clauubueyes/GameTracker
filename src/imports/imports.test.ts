import { describe, expect, it } from 'vitest'
import { parseImportedFile, parseImportedFiles } from './index'

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
      originalPlatform: 'PC',
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

  it('importa un manifiesto .item de Epic', () => {
    const games = parseImportedFile(
      JSON.stringify({
        FormatVersion: 0,
        AppName: 'Turaco',
        DisplayName: 'Nuclear Throne',
        CatalogNamespace: '742f165671424189aecdfdadf5ea9755',
        CatalogItemId: '3524134c7a4e4cf2832d8d2a634baef8',
        InstallLocation: 'D:\\Epic Games\\NuclearThrone',
        bIsApplication: true,
        bIsExecutable: true,
        bIsIncompleteInstall: false,
      }),
    )

    expect(games).toHaveLength(1)
    expect(games[0]).toMatchObject({
      id: 'epic-3524134c7a4e4cf2832d8d2a634baef8',
      title: 'Nuclear Throne',
      platform: 'epic',
      status: 'backlog',
      originalPlatform: 'PC',
      hours: 0,
    })
  })

  it('ignora componentes y componentes incompletos de Epic', () => {
    const games = parseImportedFile(
      JSON.stringify([
        {
          AppName: 'Game',
          DisplayName: 'Juego',
          CatalogItemId: 'game',
          bIsApplication: true,
        },
        {
          AppName: 'Dlc',
          DisplayName: 'DLC',
          CatalogItemId: 'dlc',
          bIsApplication: false,
        },
        {
          AppName: 'Broken',
          DisplayName: 'Roto',
          CatalogItemId: 'broken',
          bIsIncompleteInstall: true,
        },
      ]),
    )

    expect(games).toHaveLength(1)
    expect(games[0].title).toBe('Juego')
  })

  it('combina varios archivos y deduplica por id', () => {
    const games = parseImportedFiles([
      JSON.stringify({
        AppName: 'Game',
        DisplayName: 'Juego',
        CatalogItemId: 'game',
      }),
      JSON.stringify({
        AppName: 'Game',
        DisplayName: 'Juego actualizado',
        CatalogItemId: 'game',
      }),
      JSON.stringify({
        response: {
          games: [{ appid: 10, name: 'Steam', playtime_forever: 60 }],
        },
      }),
    ])

    expect(games).toHaveLength(2)
    expect(games.find((game) => game.id === 'epic-game')?.title).toBe(
      'Juego actualizado',
    )
    expect(games.find((game) => game.id === 'steam-10')?.platform).toBe('steam')
  })

  it('normaliza plataforma original, fecha de compra y etiquetas', () => {
    const games = parseImportedFile(
      JSON.stringify({
        games: [
          {
            title: 'Juego',
            originalPlatform: ' NES ',
            purchaseDate: '2024-02-29',
            tags: [' RPG ', 'rpg', 'retro', 3, ''],
          },
          {
            title: 'Con fecha inválida',
            purchaseDate: '2024-02-30',
          },
        ],
      }),
    )

    expect(games[0]).toMatchObject({
      originalPlatform: 'NES',
      purchaseDate: '2024-02-29',
      tags: ['RPG', 'retro'],
    })
    expect(games[1].purchaseDate).toBe('')
  })
})
