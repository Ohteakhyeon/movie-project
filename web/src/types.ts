export interface Movie {
  id: number
  title: string
  runtime: number
  genre: string
  rating: number
  poster_color: string
  poster_url: string
}

export interface Seat {
  id: string
  row: string
  number: number
  status: 'available' | 'reserved'
}

export interface SeatLayout {
  rows: string[]
  seatsPerRow: number
}

export interface SeatsResponse {
  movie: Movie
  layout: SeatLayout
  seats: Seat[]
}

export interface Reservation {
  id: number
  movie_id: number
  movie_title: string
  genre?: string
  runtime?: number
  seats: string[]
  customer_name: string
  created_at: string
}

export interface CreateReservationPayload {
  movieId: number
  seats: string[]
  customerName: string
}
