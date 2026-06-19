import { useCallback, useEffect, useState } from 'react'
import { fetchMovies, fetchReservations } from './api'
import MovieList from './components/MovieList'
import SeatPicker from './components/SeatPicker'
import ReservationHistory from './components/ReservationHistory'
import type { Movie, Reservation } from './types'
import './App.css'

type Tab = 'movies' | 'history'
type Step = 'list' | 'seats' | 'done'

function App() {
  const [tab, setTab] = useState<Tab>('movies')
  const [step, setStep] = useState<Step>('list')
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [moviesLoading, setMoviesLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)

  const loadMovies = useCallback(async () => {
    try {
      setMoviesLoading(true)
      setMovies(await fetchMovies())
    } catch {
      setMovies([])
    } finally {
      setMoviesLoading(false)
    }
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true)
      setReservations(await fetchReservations())
    } catch {
      setReservations([])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMovies()
  }, [loadMovies])

  useEffect(() => {
    if (tab === 'history') loadHistory()
  }, [tab, loadHistory])

  function handleSelectMovie(movie: Movie) {
    setSelectedMovie(movie)
    setStep('seats')
  }

  function handleReservationComplete() {
    setStep('done')
    setTab('history')
    loadHistory()
  }

  function handleTabChange(next: Tab) {
    setTab(next)
    if (next === 'movies') {
      setStep('list')
      setSelectedMovie(null)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 영화 예매</h1>
        <nav className="tab-nav">
          <button
            type="button"
            className={tab === 'movies' ? 'active' : ''}
            onClick={() => handleTabChange('movies')}
          >
            영화 선택
          </button>
          <button
            type="button"
            className={tab === 'history' ? 'active' : ''}
            onClick={() => handleTabChange('history')}
          >
            예매 내역
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === 'movies' && step === 'list' && (
          <>
            <p className="section-desc">상영 중인 영화를 선택하고 좌석을 예매하세요.</p>
            <MovieList
              movies={movies}
              loading={moviesLoading}
              onSelect={handleSelectMovie}
            />
          </>
        )}

        {tab === 'movies' && step === 'seats' && selectedMovie && (
          <SeatPicker
            movie={selectedMovie}
            onBack={() => setStep('list')}
            onComplete={handleReservationComplete}
          />
        )}

        {tab === 'movies' && step === 'done' && (
          <div className="success-banner">
            <p>예매가 완료되었습니다!</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleTabChange('history')}
            >
              예매 내역 보기
            </button>
          </div>
        )}

        {tab === 'history' && (
          <ReservationHistory
            reservations={reservations}
            loading={historyLoading}
            onRefresh={loadHistory}
          />
        )}
      </main>
    </div>
  )
}

export default App
