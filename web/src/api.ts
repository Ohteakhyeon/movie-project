import type {
  CreateReservationPayload,
  Movie,
  Reservation,
  SeatsResponse,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? '요청에 실패했습니다.')
  }

  return data as T
}

export function fetchMovies() {
  return request<Movie[]>('/api/movies')
}

export function fetchSeats(movieId: number) {
  return request<SeatsResponse>(`/api/movies/${movieId}/seats`)
}

export function createReservation(payload: CreateReservationPayload) {
  return request<Reservation>('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function fetchReservations() {
  return request<Reservation[]>('/api/reservations')
}
