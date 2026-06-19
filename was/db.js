import mysql from 'mysql2/promise'
import { config } from './config.js'

const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '+09:00',
})

export async function waitForDb(retries = 30, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1')
      return
    } catch (error) {
      if (attempt === retries) throw error
      console.log(`DB 연결 대기 중... (${attempt}/${retries})`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

export default pool
