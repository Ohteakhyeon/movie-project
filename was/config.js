import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: join(__dirname, '.env') })
dotenv.config({ path: join(__dirname, '..', '.env') })

export const config = {
  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'movie_user',
    password: process.env.DB_PASSWORD ?? 'movie_pass',
    database: process.env.DB_NAME ?? 'movie_db',
  },
  was: {
    port: Number(process.env.WAS_PORT ?? 3001),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
}

function isDevOrigin(origin) {
  if (!origin) return true
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
}

export function isAllowedOrigin(origin) {
  if (process.env.NODE_ENV === 'production') {
    return origin === config.was.corsOrigin
  }
  return isDevOrigin(origin)
}
