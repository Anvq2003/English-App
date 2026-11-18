import { useRef, useState } from 'react'
import { Icon } from './components/Icon/Icon.tsx'
import { games } from './games/registry.ts'
import { Home } from './pages/Home/Home.tsx'
import { Manage } from './pages/Manage/Manage.tsx'
import { useDeck } from './store/deckContext.ts'
import './App.css'

export default function App() {
  const { storageOk } = useDeck()
  const [view, setView] = useState('home')
  const [showHelp, setShowHelp] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const Game = games.find((g) => g.id === view)?.component
  const navigate = (next: string) => {
    setView(next)
    setShowHelp(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
    mainRef.current?.focus({ preventScroll: true })
  }
  const title = view === 'home' ? 'Tổng quan' : view === 'manage' ? 'Thư viện từ vựng' : 'Luyện tập Flashcard'

  return (
    <div className="app">
      <a className="app__skip" href="#main-content">Đến nội dung chính</a>
      <aside className="app__sidebar">
        <button className="app__brand" onClick={() => navigate('home')} aria-label="Về trang chủ Mầm English">
          <span className="app__brand-mark"><Icon name="leaf" size={26} /></span>
          <span>mầm<span className="app__brand-caption">ENGLISH, EVERY DAY</span></span>
        </button>
        <span className="app__nav-label">GÓC HỌC TẬP</span>
        <nav className="app__nav" aria-label="Điều hướng chính">
          <button className={`app__nav-item ${view === 'home' ? 'is-active' : ''}`} aria-current={view === 'home' ? 'page' : undefined} onClick={() => navigate('home')}><Icon name="home" />Tổng quan</button>
          <button className={`app__nav-item ${Game ? 'is-active' : ''}`} aria-current={Game ? 'page' : undefined} onClick={() => navigate('flashcard')}><Icon name="cards" />Luyện tập<span className="app__nav-dot" /></button>
          <button className={`app__nav-item ${view === 'manage' ? 'is-active' : ''}`} aria-current={view === 'manage' ? 'page' : undefined} onClick={() => navigate('manage')}><Icon name="library" />Thư viện từ vựng</button>
        </nav>
        <div className="app__sidebar-bottom">
          <div className="app__note"><Icon name="leaf" size={26} /><strong>Mỗi từ mới,<br />một bước tiến nhỏ.</strong><p>Học một chút mỗi ngày.<br />Để tiếng Anh lớn lên cùng bạn.</p><span>Keep growing.</span></div>
          <button className={`app__help ${showHelp ? 'is-active' : ''}`} aria-expanded={showHelp} aria-controls="app-help" onClick={() => setShowHelp(!showHelp)}><Icon name="help" size={18} />Hướng dẫn sử dụng</button>
          <div className="app__privacy"><Icon name="shield" size={15} />Dữ liệu ở trên máy của bạn</div>
        </div>
      </aside>
      <div className="app__workspace">
        <header className="app__header">
          <div className="app__breadcrumb"><span>Góc học tập</span><Icon name="chevron" size={13} /><strong>{title}</strong></div>
          <span className={`app__save-status ${storageOk ? '' : 'is-warning'}`}><span />{storageOk ? 'Lưu trên thiết bị' : 'Chưa thể lưu dữ liệu'}</span>
        </header>
        <main id="main-content" className="app__main" tabIndex={-1} ref={mainRef}>
          {!storageOk && <p className="notice is-warning" role="alert">Trình duyệt không cho lưu dữ liệu. Tiến độ có thể mất khi tải lại trang. Hãy tải JSON để sao lưu sau khi học.</p>}
          {showHelp ? <section id="app-help" className="app__help-panel"><div><span className="eyebrow">BẮT ĐẦU THẬT ĐƠN GIẢN</span><h1>Góc nhỏ, cách học của bạn.</h1><p>Không tài khoản, không cài đặt phức tạp. Chỉ cần một bộ từ và vài phút tập trung.</p></div><ol><li><strong>Thêm từ vựng</strong><p>Vào Thư viện để nhập file JSON hoặc dùng bộ từ mẫu ở trang Tổng quan.</p></li><li><strong>Học bằng Flashcard</strong><p>Chọn chiều học, nhấn Space để lật thẻ, rồi tự chấm bằng phím 1 hoặc 2.</p></li><li><strong>Ôn lại đúng lúc</strong><p>Từ chưa nhớ sẽ được ưu tiên. Từ đã nhớ sẽ quay lại sau 1, 3, 7, 14 hoặc 30 ngày.</p></li><li><strong>Giữ một bản sao</strong><p>Tải JSON trong Thư viện hoặc cuối phiên để lưu cả từ vựng và tiến độ.</p></li></ol><button className="btn is-primary" onClick={() => navigate('home')}>Về góc học tập<Icon name="arrow" size={17} /></button></section> : Game ? <Game onExit={() => navigate('home')} /> : view === 'manage' ? <Manage /> : <Home onPlay={navigate} onManage={() => navigate('manage')} />}
        </main>
        <footer className="app__footer"><span>Chậm mà chắc. Mỗi ngày một chút.</span><span>Made for your own pace <Icon name="leaf" size={14} /></span></footer>
      </div>
    </div>
  )
}
