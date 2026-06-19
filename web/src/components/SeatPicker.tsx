import { useEffect, useState } from 'react'
import { fetchSeats, createReservation } from '../api'
import type { Movie, Seat } from '../types'

interface Props {
  movie: Movie
  onBack: () => void
  onComplete: () => void
}

export default function SeatPicker({ movie, onBack, onComplete }: Props) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [layout, setLayout] = useState<{ rows: string[]; seatsPerRow: number } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customerName, setCustomerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchSeats(movie.id)
        if (!cancelled) {
          setSeats(data.seats)
          setLayout(data.layout)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '좌석 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [movie.id])

  function toggleSeat(seat: Seat) {
    if (seat.status === 'reserved') return

    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(seat.id)) next.delete(seat.id)
      else next.add(seat.id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.size === 0) {
      setError('좌석을 하나 이상 선택해 주세요.')
      return
    }
    if (!customerName.trim()) {
      setError('예매자 이름을 입력해 주세요.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await createReservation({
        movieId: movie.id,
        seats: [...selected].sort(),
        customerName: customerName.trim(),
      })
      onComplete()
    } catch (e) {
      setError(e instanceof Error ? e.message : '예매에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="status-message">좌석 정보를 불러오는 중...</p>
  }

  const seatsByRow = layout?.rows.map((row) =>
    seats.filter((s) => s.row === row),
  )

  return (
    <div className="seat-picker">
      <div className="seat-picker-header">
        <button type="button" className="btn-text" onClick={onBack}>
          ← 영화 목록
        </button>
        <div>
          <h2>{movie.title}</h2>
          <p className="movie-meta">
            {movie.genre} · {movie.runtime}분
          </p>
        </div>
      </div>

      <div className="screen">SCREEN</div>

      <div className="seat-legend">
        <span><i className="seat-dot available" /> 선택 가능</span>
        <span><i className="seat-dot selected" /> 선택됨</span>
        <span><i className="seat-dot reserved" /> 예매됨</span>
      </div>

      <div className="seat-map">
        {seatsByRow?.map((rowSeats) => (
          <div key={rowSeats[0]?.row} className="seat-row">
            <span className="row-label">{rowSeats[0]?.row}</span>
            {rowSeats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                className={[
                  'seat',
                  seat.status === 'reserved' ? 'reserved' : '',
                  selected.has(seat.id) ? 'selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={seat.status === 'reserved'}
                onClick={() => toggleSeat(seat)}
                aria-label={`${seat.id} ${seat.status === 'reserved' ? '예매됨' : selected.has(seat.id) ? '선택됨' : '선택 가능'}`}
              >
                {seat.number}
              </button>
            ))}
          </div>
        ))}
      </div>

      <form className="reservation-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="customerName">예매자 이름</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="이름을 입력하세요"
            maxLength={50}
          />
        </div>

        <div className="selection-summary">
          <span>
            선택 좌석:{' '}
            {selected.size > 0
              ? [...selected].sort().join(', ')
              : '없음'}
          </span>
          <span>{selected.size}매</span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || selected.size === 0}
        >
          {submitting ? '예매 중...' : '예매하기'}
        </button>
      </form>
    </div>
  )
}
