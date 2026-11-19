import type { Game } from '../types'

interface StatsProps {
  games: Game[]
}

export function Stats({ games }: StatsProps) {
  const total = games.length
  const hours = games.reduce((sum, game) => sum + game.hours, 0)
  const completed = games.filter((game) => game.status === 'completed').length
  const playing = games.filter((game) => game.status === 'playing').length

  const cards = [
    { label: 'Juegos', value: String(total) },
    { label: 'Horas jugadas', value: `${Math.round(hours)} h` },
    { label: 'Completados', value: String(completed) },
    { label: 'Jugando ahora', value: String(playing) },
  ]

  return (
    <section className="stats" aria-label="Resumen de la biblioteca">
      {cards.map((card) => (
        <div key={card.label} className="stat-card">
          <span className="stat-card__value">{card.value}</span>
          <span className="stat-card__label">{card.label}</span>
        </div>
      ))}
    </section>
  )
}
