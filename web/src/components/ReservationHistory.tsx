import type { Reservation } from '../types'

interface Props {
  reservations: Reservation[]
  loading: boolean
  onRefresh: () => void
}

export default function ReservationHistory({
  reservations,
  loading,
  onRefresh,
}: Props) {
  return (
    <div className="reservation-history">
      <div className="history-header">
        <h2>예매 내역</h2>
        <button type="button" className="btn-text" onClick={onRefresh}>
          새로고침
        </button>
      </div>

      {loading ? (
        <p className="status-message">예매 내역을 불러오는 중...</p>
      ) : reservations.length === 0 ? (
        <p className="status-message empty">아직 예매 내역이 없습니다.</p>
      ) : (
        <ul className="reservation-list">
          {reservations.map((r) => (
            <li key={r.id} className="reservation-item">
              <div className="reservation-main">
                <h3>{r.movie_title}</h3>
                <p className="reservation-seats">
                  좌석 {r.seats.join(', ')}
                </p>
              </div>
              <div className="reservation-meta">
                <span>{r.customer_name}</span>
                <time>{formatDate(r.created_at)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso.replace(' ', 'T'))
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
