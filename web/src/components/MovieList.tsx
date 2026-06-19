import type { Movie } from '../types'

interface Props {
  movies: Movie[]
  loading: boolean
  onSelect: (movie: Movie) => void
}

export default function MovieList({ movies, loading, onSelect }: Props) {
  if (loading) {
    return <p className="status-message">영화 목록을 불러오는 중...</p>
  }

  if (movies.length === 0) {
    return <p className="status-message">상영 중인 영화가 없습니다.</p>
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <button
          key={movie.id}
          type="button"
          className="movie-card"
          onClick={() => onSelect(movie)}
        >
          <div className="movie-poster">
            <img
              src={movie.poster_url}
              alt={`${movie.title} 포스터`}
              loading="lazy"
            />
          </div>
          <div className="movie-info">
            <h3>{movie.title}</h3>
            <p className="movie-meta">
              {movie.genre} · {movie.runtime}분
            </p>
            <p className="movie-rating">
              ★ {Number(movie.rating).toFixed(1)}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
