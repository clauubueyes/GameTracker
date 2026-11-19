import {
  PLATFORMS,
  PLATFORM_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Game,
} from '../types'

interface Bar {
  key: string
  label: string
  count: number
}

interface ChartBlockProps {
  title: string
  bars: Bar[]
  total: number
  kind: 'platform' | 'status'
}

function ChartBlock({ title, bars, total, kind }: ChartBlockProps) {
  return (
    <div className="chart">
      <h2>{title}</h2>
      <div className="chart__rows">
        {bars.map((bar) => {
          const percent = total > 0 ? (bar.count / total) * 100 : 0

          return (
            <div key={bar.key} className="chart-row">
              <span className="chart-row__label">{bar.label}</span>
              <div className="chart-row__track">
                <div
                  className={`chart-row__fill chart-row__fill--${kind}-${bar.key}`}
                  style={{ width: percent > 0 ? `${Math.max(percent, 2)}%` : '0' }}
                />
              </div>
              <span className="chart-row__value">{bar.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ChartsProps {
  games: Game[]
}

export function Charts({ games }: ChartsProps) {
  const platformBars = PLATFORMS.map((platform) => ({
    key: platform,
    label: PLATFORM_LABELS[platform],
    count: games.filter((game) => game.platform === platform).length,
  }))

  const statusBars = STATUSES.map((status) => ({
    key: status,
    label: STATUS_LABELS[status],
    count: games.filter((game) => game.status === status).length,
  }))

  return (
    <section className="charts" aria-label="Distribución de la biblioteca">
      <ChartBlock title="Por plataforma" bars={platformBars} total={games.length} kind="platform" />
      <ChartBlock title="Por estado" bars={statusBars} total={games.length} kind="status" />
    </section>
  )
}
