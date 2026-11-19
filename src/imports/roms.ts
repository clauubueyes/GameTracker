import type { Game } from '../types'

export interface RomFileInput {
  name: string
  webkitRelativePath?: string
}

const ROM_EXTENSIONS = new Set([
  '3ds',
  '7z',
  'a26',
  'a48',
  'bin',
  'c64',
  'chd',
  'cia',
  'cue',
  'dsk',
  'elf',
  'fba',
  'gba',
  'gb',
  'gbc',
  'gcm',
  'genesis',
  'gg',
  'iso',
  'lnx',
  'mame',
  'md',
  'mdf',
  'n64',
  'nds',
  'neo',
  'nes',
  'nrg',
  'nsp',
  'pce',
  'ps2',
  'psp',
  'psx',
  'rar',
  'rom',
  'sms',
  'smc',
  'snes',
  'tap',
  'v64',
  'wii',
  'wbfs',
  'xbe',
  'z64',
  'zip',
  'z80',
])

function extensionOf(name: string): string {
  const index = name.lastIndexOf('.')
  return index > 0 ? name.slice(index + 1).toLowerCase() : ''
}

function cleanTitle(name: string): string {
  const withoutExtension = name.replace(/\.[^.]+$/, '')

  return withoutExtension
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function relativePath(input: RomFileInput): string {
  return (input.webkitRelativePath || input.name).replace(/\\/g, '/')
}

function sourceKey(input: RomFileInput, title: string): string {
  const segments = relativePath(input).split('/')
  const directory = segments.slice(0, -1).join('/')
  return slug(`${directory ? `${directory}/` : ''}${title}`)
}

export function parseRomFiles(inputs: RomFileInput[]): Game[] {
  const byId = new Map<string, Game>()

  for (const input of inputs) {
    if (!ROM_EXTENSIONS.has(extensionOf(input.name))) continue

    const title = cleanTitle(input.name)
    const key = sourceKey(input, title)
    if (!title || !key) continue

    const id = `rom-${key}`
    const now = new Date().toISOString()

    byId.set(id, {
      id,
      title,
      platform: 'emulator',
      status: 'backlog',
      hours: 0,
      rating: 0,
      notes: `ROM: ${relativePath(input)}`,
      addedAt: now,
      updatedAt: now,
    })
  }

  if (byId.size === 0) {
    throw new Error('No se encontraron ROMs con extensiones reconocidas.')
  }

  return [...byId.values()]
}
