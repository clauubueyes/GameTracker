import {
  PLATFORM_LABELS,
  STATUS_LABELS,
  type Game,
} from '../types'

interface GameListProps {
  games: Game[]
  filtered: boolean
  onEdit: (game: Game) => void
  onDelete: (game: Game) => void
}

export function GameList({ games, filtered, onEdit, onDelete }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon" aria-hidden="true">
          ◈
        </span>
        <h2>{filtered ? 'Sin resultados' : 'Aún no hay juegos'}</h2>
        <p>
          {filtered
            ? 'Prueba con otra búsqueda o cambia los filtros.'
            : 'Añade tu primer juego o importa una copia de tu biblioteca en JSON.'}
        </p>
      </div>
    )
  }

  return (
    <ul className="game-list">
      {games.map((game) => (
        <li key={game.id} className="game-card">
          <div className="game-card__main">
            <h3>{game.title}</h3>
            <div className="badges">
              <span className={`badge badge--${game.platform}`}>
                {PLATFORM_LABELS[game.platform]}
              </span>
              <span className={`badge badge--status-${game.status}`}>
                {STATUS_LABELS[game.status]}
              </span>
            </div>
            {game.notes && <p className="game-card__notes">{game.notes}</p>}
          </div>

          <div className="game-card__meta">
            <span className="stat-line">
              <strong>{game.hours}</strong> h jugadas
            </span>
            <span className="rating" aria-label={`Valoración ${game.rating} de 5`}>
              {game.rating > 0 ? '★'.repeat(game.rating) : '—'}
            </span>
            <div className="game-card__actions">
              <button type="button" onClick={() => onEdit(game)}>
                Editar
              </button>
              <button
                type="button"
                className="button--danger"
                onClick={() => onDelete(game)}
              >
                Borrar
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
