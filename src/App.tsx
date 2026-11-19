import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { GameForm } from './components/GameForm'
import { GameList } from './components/GameList'
import { Stats } from './components/Stats'
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

type SortKey = 'updated' | 'title' | 'hours'

function toDraft(game: Game): GameDraft {
  return {
    title: game.title,
    platform: game.platform,
    status: game.status,
    hours: game.hours,
    rating: game.rating,
    notes: game.notes,
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
  const [sort, setSort] = useState<SortKey>('updated')
  const [editing, setEditing] = useState<Game | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => saveGames(games), [games])

  const visibleGames = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    const filtered = games.filter((game) => {
      const matchesSearch =
        !term ||
        game.title.toLocaleLowerCase().includes(term) ||
        game.notes.toLocaleLowerCase().includes(term)
      const matchesPlatform = platform === 'all' || game.platform === platform
      const matchesStatus = status === 'all' || game.status === status
      return matchesSearch && matchesPlatform && matchesStatus
    })

    return filtered.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'hours') return b.hours - a.hours
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [games, search, platform, status, sort])

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
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const imported = await importGames(file)
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

        <section className="toolbar" aria-label="Herramientas de la biblioteca">
          <div className="toolbar__filters">
            <input
              className="search"
              type="search"
              value={search}
              placeholder="Buscar juegos o notas..."
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
              accept="application/json,.json"
              hidden
              onChange={handleImport}
            />
            <button
              type="button"
              className="button button--ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              Importar
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
