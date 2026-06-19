import pool from './db.js'

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
export const SEATS_PER_ROW = 10

export function getAllSeatIds() {
  return ROWS.flatMap((row) =>
    Array.from({ length: SEATS_PER_ROW }, (_, i) => `${row}${i + 1}`),
  )
}

export function parseSeats(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return JSON.parse(value)
  return []
}

export async function getReservedSeats(movieId, connection = pool) {
  const [rows] = await connection.query(
    'SELECT seats FROM reservations WHERE movie_id = ?',
    [movieId],
  )

  const reserved = new Set()
  for (const row of rows) {
    for (const seat of parseSeats(row.seats)) {
      reserved.add(seat)
    }
  }
  return reserved
}
