import { describe, expect, it } from 'vitest'
import { parseRomFiles } from './roms'

describe('parseRomFiles', () => {
  it('crea juegos a partir de una carpeta de ROMs', () => {
    const games = parseRomFiles([
      {
        name: 'Super Mario Bros. (USA).nes',
        webkitRelativePath: 'ROMs/Nintendo/Super Mario Bros. (USA).nes',
      },
      {
        name: 'The Legend of Zelda_[!].zip',
        webkitRelativePath: 'ROMs/Nintendo/The Legend of Zelda_[!].zip',
      },
      { name: 'readme.txt', webkitRelativePath: 'ROMs/readme.txt' },
    ])

    expect(games).toHaveLength(2)
    expect(games.map((game) => game.title)).toEqual([
      'Super Mario Bros.',
      'The Legend of Zelda',
    ])
    expect(games[0]).toMatchObject({
      platform: 'emulator',
      status: 'backlog',
      originalPlatform: 'NES',
      hours: 0,
    })
  })

  it('deduplica el bin y el cue de un mismo juego', () => {
    const games = parseRomFiles([
      { name: 'Juego.bin', webkitRelativePath: 'PSX/Juego.bin' },
      { name: 'Juego.cue', webkitRelativePath: 'PSX/Juego.cue' },
    ])

    expect(games).toHaveLength(1)
    expect(games[0].notes).toBe('ROM: PSX/Juego.cue')
  })

  it('rechaza una carpeta sin ROMs reconocidas', () => {
    expect(() => parseRomFiles([{ name: 'portada.png' }])).toThrow(
      'No se encontraron ROMs con extensiones reconocidas.',
    )
  })
})
