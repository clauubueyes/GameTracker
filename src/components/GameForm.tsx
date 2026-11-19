import { useState, type FormEvent } from 'react'
import {
  PLATFORMS,
  PLATFORM_LABELS,
  STATUSES,
  STATUS_LABELS,
  type GameDraft,
  type Platform,
  type Status,
} from '../types'

function parseTags(text: string): string[] {
  const tags = new Map<string, string>()
  for (const raw of text.split(',')) {
    const tag = raw.trim()
    if (!tag) continue

    const key = tag.toLocaleLowerCase()
    if (!tags.has(key)) tags.set(key, tag)
  }
  return [...tags.values()]
}

interface GameFormProps {
  initial: GameDraft
  isEditing: boolean
  onSubmit: (draft: GameDraft) => void
  onCancel: () => void
}

export function GameForm({
  initial,
  isEditing,
  onSubmit,
  onCancel,
}: GameFormProps) {
  const [draft, setDraft] = useState<GameDraft>(initial)
  const [tagsText, setTagsText] = useState(initial.tags.join(', '))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = draft.title.trim()
    if (!title) return

    onSubmit({
      ...draft,
      title,
      hours: Math.max(0, draft.hours),
      tags: parseTags(tagsText),
    })
  }

  return (
    <form className="game-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{isEditing ? 'Editar juego' : 'Nuevo juego'}</h2>
        <button type="button" className="icon-button" onClick={onCancel} aria-label="Cerrar formulario">
          ×
        </button>
      </div>

      <div className="form-grid">
        <label className="field field--wide">
          <span>Título</span>
          <input
            autoFocus
            required
            value={draft.title}
            placeholder="Ej. Hollow Knight"
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </label>

        <label className="field">
          <span>Plataforma</span>
          <select
            value={draft.platform}
            onChange={(event) =>
              setDraft({ ...draft, platform: event.target.value as Platform })
            }
          >
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {PLATFORM_LABELS[platform]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Estado</span>
          <select
            value={draft.status}
            onChange={(event) =>
              setDraft({ ...draft, status: event.target.value as Status })
            }
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Horas jugadas</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={draft.hours}
            onChange={(event) =>
              setDraft({ ...draft, hours: Number(event.target.value) || 0 })
            }
          />
        </label>

        <label className="field">
          <span>Valoración</span>
          <select
            value={draft.rating}
            onChange={(event) =>
              setDraft({ ...draft, rating: Number(event.target.value) })
            }
          >
            <option value={0}>Sin valorar</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {'★'.repeat(rating)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Plataforma original</span>
          <input
            value={draft.originalPlatform}
            placeholder="Ej. NES, PC, PlayStation 2"
            onChange={(event) =>
              setDraft({ ...draft, originalPlatform: event.target.value })
            }
          />
        </label>

        <label className="field">
          <span>Fecha de compra</span>
          <input
            type="date"
            value={draft.purchaseDate}
            onChange={(event) =>
              setDraft({ ...draft, purchaseDate: event.target.value })
            }
          />
        </label>

        <label className="field field--wide">
          <span>Etiquetas (separadas por comas)</span>
          <input
            value={tagsText}
            placeholder="Ej. RPG, retro, favoritos"
            onChange={(event) => setTagsText(event.target.value)}
          />
        </label>

        <label className="field field--wide">
          <span>Notas</span>
          <textarea
            rows={2}
            value={draft.notes}
            placeholder="Comentarios, progreso..."
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="button button--ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="button button--primary">
          {isEditing ? 'Guardar cambios' : 'Añadir juego'}
        </button>
      </div>
    </form>
  )
}
