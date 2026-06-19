import express from 'express'
import cors from 'cors'
import pool, { waitForDb } from './db.js'
import { config, isAllowedOrigin } from './config.js'
import {
  ROWS,
  SEATS_PER_ROW,
  getAllSeatIds,
  getReservedSeats,
  parseSeats,
} from './seats.js'

const app = express()

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin))
    },
  }),
)
app.use(express.json())

app.use((error, _req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: '잘못된 JSON 형식입니다.' })
  }
  next(error)
})

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', tier: 'was', database: 'mariadb' })
  } catch {
    res.status(503).json({ status: 'error', message: 'DB 연결 실패' })
  }
})

app.get('/api/movies', async (_req, res) => {
  try {
    const [movies] = await pool.query('SELECT * FROM movies ORDER BY id')
    res.json(movies)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '영화 목록 조회에 실패했습니다.' })
  }
})

app.get('/api/movies/:id/seats', async (req, res) => {
  const movieId = Number(req.params.id)

  try {
    const [rows] = await pool.query('SELECT * FROM movies WHERE id = ?', [
      movieId,
    ])
    const movie = rows[0]

    if (!movie) {
      return res.status(404).json({ error: '영화를 찾을 수 없습니다.' })
    }

    const reserved = await getReservedSeats(movieId)
    const seats = getAllSeatIds().map((id) => ({
      id,
      row: id[0],
      number: Number(id.slice(1)),
      status: reserved.has(id) ? 'reserved' : 'available',
    }))

    res.json({
      movie,
      layout: { rows: ROWS, seatsPerRow: SEATS_PER_ROW },
      seats,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '좌석 조회에 실패했습니다.' })
  }
})

app.post('/api/reservations', async (req, res) => {
  const { movieId, seats, customerName } = req.body

  if (!movieId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: '영화와 좌석을 선택해 주세요.' })
  }

  if (!customerName?.trim()) {
    return res.status(400).json({ error: '예매자 이름을 입력해 주세요.' })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const [movieRows] = await connection.query(
      'SELECT * FROM movies WHERE id = ?',
      [movieId],
    )
    if (movieRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: '영화를 찾을 수 없습니다.' })
    }

    const validSeats = new Set(getAllSeatIds())
    for (const seat of seats) {
      if (!validSeats.has(seat)) {
        await connection.rollback()
        return res
          .status(400)
          .json({ error: `유효하지 않은 좌석입니다: ${seat}` })
      }
    }

    const reserved = await getReservedSeats(movieId, connection)
    const conflict = seats.filter((seat) => reserved.has(seat))
    if (conflict.length > 0) {
      await connection.rollback()
      return res.status(409).json({
        error: `이미 예매된 좌석입니다: ${conflict.join(', ')}`,
      })
    }

    const [insertResult] = await connection.query(
      `INSERT INTO reservations (movie_id, seats, customer_name)
       VALUES (?, ?, ?)`,
      [movieId, JSON.stringify(seats), customerName.trim()],
    )

    await connection.commit()

    const [reservationRows] = await pool.query(
      `SELECT r.*, m.title AS movie_title
       FROM reservations r
       JOIN movies m ON m.id = r.movie_id
       WHERE r.id = ?`,
      [insertResult.insertId],
    )

    const reservation = reservationRows[0]
    res.status(201).json({
      ...reservation,
      seats: parseSeats(reservation.seats),
    })
  } catch (error) {
    await connection.rollback()
    console.error(error)
    res.status(500).json({ error: '예매 등록에 실패했습니다.' })
  } finally {
    connection.release()
  }
})

app.get('/api/reservations', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, m.title AS movie_title, m.genre, m.runtime
       FROM reservations r
       JOIN movies m ON m.id = r.movie_id
       ORDER BY r.created_at DESC`,
    )

    res.json(
      rows.map((row) => ({
        ...row,
        seats: parseSeats(row.seats),
      })),
    )
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '예매 내역 조회에 실패했습니다.' })
  }
})

async function start() {
  await waitForDb()

  const server = app.listen(config.was.port, () => {
    console.log(`[WAS] API server running at http://localhost:${config.was.port}`)
    console.log(`[WAS] Connected to MariaDB at ${config.db.host}:${config.db.port}/${config.db.database}`)
  })

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `[WAS] Port ${config.was.port} is already in use.\n` +
          '      Stop the old server process and run again:\n' +
          `      npx kill-port ${config.was.port}`,
      )
    } else {
      console.error('[WAS] Server error:', error.message)
    }
    process.exit(1)
  })
}

start().catch((error) => {
  console.error('[WAS] Failed to start:', error.message)
  process.exit(1)
})
