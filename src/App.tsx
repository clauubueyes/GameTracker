import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Charts } from './components/Charts'
import { GameForm } from './components/GameForm'
import { GameList } from './components/GameList'
import { Stats } from './components/Stats'
import {
  filterAndSortGames,
  getAvailableTags,
  getAvailableYears,
  type SortKey,
} from './filters'
import { parseRomFiles } from './imports/roms'
import { exportGames, importGames, loadGames, saveGames } from './storage'
import {
  EMPTY_DRAFT,
  PLATFORMS,
  PLATFORM_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Game,
  type GameDraft,
  type Platform,
  type Status,
} from './types'

function toDraft(game: Game): GameDraft {
  return {
    title: game.title,
    platform: game.platform,
    status: game.status,
    hours: game.hours,
    rating: game.rating,
    notes: game.notes,
    originalPlatform: game.originalPlatform,
    purchaseDate: game.purchaseDate,
    tags: game.tags,
  }
}

function mergeGames(current: Game[], imported: Game[]): Game[] {
  const byId = new Map(current.map((game) => [game.id, game]))
  for (const game of imported) byId.set(game.id, game)
  return [...byId.values()]
}

export default function App() {
  const [games, setGames] = useState<Game[]>(loadGames)
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [tag, setTag] = useState('')
  const [year, setYear] = useState('')
  const [sort, setSort] = useState<SortKey>('updated')
  const [editing, setEditing] = useState<Game | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const directoryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => saveGames(games), [games])

  useEffect(() => {
    directoryInputRef.current?.setAttribute('webkitdirectory', '')
  }, [])

  const availableTags = useMemo(() => getAvailableTags(games), [games])
  const availableYears = useMemo(() => getAvailableYears(games), [games])

  const visibleGames = useMemo(
    () =>
      filterAndSortGames(games, {
        search,
        platform,
        status,
        tag,
        year,
        sort,
      }),
    [games, search, platform, status, tag, year, sort],
  )

  const hasFilters =
    search !== '' ||
    platform !== 'all' ||
    status !== 'all' ||
    tag !== '' ||
    year !== ''

  const clearFilters = () => {
    setSearch('')
    setPlatform('all')
    setStatus('all')
    setTag('')
    setYear('')
  }

  const handleSave = (draft: GameDraft) => {
    const now = new Date().toISOString()

    if (editing) {
      setGames((current) =>
        current.map((game) =>
          game.id === editing.id ? { ...game, ...draft, updatedAt: now } : game,
        ),
      )
      setNotice('Juego actualizado.')
    } else {
      setGames((current) => [
        {
          ...draft,
          id: crypto.randomUUID(),
          addedAt: now,
          updatedAt: now,
        },
        ...current,
      ])
      setNotice('Juego añadido.')
    }

    setError('')
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = (game: Game) => {
    if (!window.confirm(`¿Borrar "${game.title}" de la biblioteca?`)) return

    setGames((current) => current.filter((item) => item.id !== game.id))
    if (editing?.id === game.id) {
      setEditing(null)
      setShowForm(false)
    }
    setNotice('Juego borrado.')
    setError('')
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return

    try {
      const imported = await importGames(files)
      setGames((current) => mergeGames(current, imported))
      setNotice(`${imported.length} juegos importados.`)
      setError('')
    } catch (cause) {
      setNotice('')
      setError(
        cause instanceof Error ? cause.message : 'No se pudo importar el archivo.',
      )
    }
  }

  const handleRoms = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      webkitRelativePath: file.webkitRelativePath,
    }))
    event.target.value = ''
    if (files.length === 0) return

    try {
      const imported = parseRomFiles(files)
      setGames((current) => mergeGames(current, imported))
      setNotice(`${imported.length} ROMs importadas.`)
      setError('')
    } catch (cause) {
      setNotice('')
      setError(
        cause instanceof Error ? cause.message : 'No se pudo importar la carpeta.',
      )
    }
  }

  const handleExport = () => {
    exportGames(games)
    setNotice('Copia de la biblioteca exportada.')
    setError('')
  }

  const openNew = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (game: Game) => {
    setEditing(game)
    setShowForm(true)
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="hero__eyebrow">Tu biblioteca, en un solo lugar</p>
          <h1>GameTracker</h1>
          <p className="hero__subtitle">
            Steam, Epic Games, emuladores y cualquier otro origen.
          </p>
        </div>
        <span className="hero__mark" aria-hidden="true">
          GT
        </span>
      </header>

      <main>
        <Stats games={games} />
        <Charts games={games} />

        <section className="toolbar" aria-label="Herramientas de la biblioteca">
          <div className="toolbar__filters">
            <input
              className="search"
              type="search"
              value={search}
              placeholder="Buscar juegos, notas o etiquetas..."
              aria-label="Buscar juegos"
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={platform}
              aria-label="Filtrar por plataforma"
              onChange={(event) =>
                setPlatform(event.target.value as Platform | 'all')
              }
            >
              <option value="all">Todas las plataformas</option>
              {PLATFORMS.map((item) => (
                <option key={item} value={item}>
                  {PLATFORM_LABELS[item]}
                </option>
              ))}
            </select>
            <select
              value={status}
              aria-label="Filtrar por estado"
              onChange={(event) => setStatus(event.target.value as Status | 'all')}
            >
              <option value="all">Todos los estados</option>
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {STATUS_LABELS[item]}
                </option>
              ))}
            </select>
            <select
              value={tag}
              aria-label="Filtrar por etiqueta"
              onChange={(event) => setTag(event.target.value)}
            >
              <option value="">Todas las etiquetas</option>
              {availableTags.map((item) => (
                <option key={item} value={item}>
                  #{item}
                </option>
              ))}
            </select>
            <select
              value={year}
              aria-label="Filtrar por año de compra"
              onChange={(event) => setYear(event.target.value)}
            >
              <option value="">Todos los años</option>
              {availableYears.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={sort}
              aria-label="Ordenar juegos"
              onChange={(event) => setSort(event.target.value as SortKey)}
            >
              <option value="updated">Más recientes</option>
              <option value="title">Por título</option>
              <option value="hours">Por horas</option>
            </select>
          </div>

          <div className="toolbar__actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json,.item"
              multiple
              hidden
              onChange={handleImport}
            />
            <input
              ref={directoryInputRef}
              type="file"
              multiple
              hidden
              onChange={handleRoms}
            />
            {hasFilters && (
              <button type="button" className="button button--ghost" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
            <button
              type="button"
              className="button button--ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              Importar archivos
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => directoryInputRef.current?.click()}
            >
              Importar ROMs
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={handleExport}
            >
              Exportar
            </button>
            <button type="button" className="button button--primary" onClick={openNew}>
              + Nuevo juego
            </button>
          </div>
        </section>

        {error && <p className="message message--error">{error}</p>}
        {!error && notice && <p className="message">{notice}</p>}

        {showForm && (
          <GameForm
            key={editing?.id ?? 'new'}
            initial={editing ? toDraft(editing) : EMPTY_DRAFT}
            isEditing={editing !== null}
            onSubmit={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
          />
        )}

        <GameList
          games={visibleGames}
          filtered={games.length > 0}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  )
}
