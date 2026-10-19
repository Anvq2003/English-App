import { games } from './games/registry.ts'
import { Home } from './pages/Home/Home.tsx'
import { Manage } from './pages/Manage/Manage.tsx'
import { useDeck } from './store/deckContext.ts'
import { useState } from 'react'
import './App.css'

// 'home' | 'manage' | a game id from the registry
type View = string

export default function App() {
  const { storageOk } = useDeck()
  const [view, setView] = useState<View>('home')
  const goHome = () => setView('home')
  const Game = games.find((g) => g.id === view)?.component

  return (
    <div className="app">
      <header className="app__header">
        <button type="button" className="app__brand" onClick={goHome}>
          English App
        </button>
        <nav className="app__nav">
          <button type="button" className="btn" onClick={goHome}>
            Trang chủ
          </button>
          <button type="button" className="btn" onClick={() => setView('manage')}>
            Quản lý
          </button>
        </nav>
      </header>
      <main className="app__main">
        {!storageOk && (
          <p className="notice is-warning" role="alert">
            Trình duyệt không cho lưu dữ liệu (localStorage). App vẫn chạy nhưng tiến độ sẽ mất khi tải lại trang. Hãy
            Download JSON để backup.
          </p>
        )}
        {Game ? (
          <Game onExit={goHome} />
        ) : view === 'manage' ? (
          <Manage />
        ) : (
          <Home onPlay={setView} onManage={() => setView('manage')} />
        )}
      </main>
    </div>
  )
}
