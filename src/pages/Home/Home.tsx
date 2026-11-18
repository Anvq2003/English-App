import { useState } from 'react'
import { Icon, type IconName } from '../../components/Icon/Icon.tsx'
import { isDue, isNew, pickWords } from '../../core/srs.ts'
import { games } from '../../games/registry.ts'
import { useDeck } from '../../store/deckContext.ts'
import './style.css'

interface HomeProps {
  onPlay: (gameId: string) => void
  onManage: () => void
}

const upcoming: { name: string; description: string; icon: IconName; theme: string }[] = [
  { name: 'Gõ theo nghĩa', description: 'Nhìn nghĩa tiếng Việt, gõ từ tiếng Anh.', icon: 'keyboard', theme: 'peach' },
  { name: 'Nghe và gõ', description: 'Lắng nghe và ghi lại từ bạn vừa nghe.', icon: 'headphones', theme: 'blue' },
  { name: 'Điền chỗ trống', description: 'Ghi nhớ từ vựng qua từng ngữ cảnh.', icon: 'text', theme: 'purple' },
]

export function Home({ onPlay, onManage }: HomeProps) {
  const { deck, importText } = useDeck()
  const [now] = useState(() => Date.now())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const words = deck?.words ?? []
  const fresh = words.filter(isNew).length
  const due = words.filter((w) => !isNew(w) && isDue(w, now)).length
  const learned = words.filter((w) => (w.progress?.box ?? 0) >= 3).length
  const studied = words.length - fresh
  const sessionSize = pickWords(words).length
  const hasWords = words.length > 0
  const percent = words.length ? Math.round(studied / words.length * 100) : 0

  const loadSample = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}sample.json`)
      if (!response.ok) throw new Error('sample unavailable')
      const errors = importText(await response.text(), 'merge')
      if (errors.length) setError(errors.join(' '))
    } catch {
      setError('Chưa tải được bộ từ mẫu. Bạn có thể thử lại hoặc nhập file JSON từ Thư viện.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="home">
      <div className="home__heading"><div><span className="eyebrow">MỘT CHÚT TIẾNG ANH MỖI NGÀY</span><h1>Chào bạn, cùng học nhé<span className="home__greeting">.</span></h1><p>Mỗi từ bạn nhớ hôm nay, mở thêm một điều mới ngày mai.</p></div><span className="home__date"><Icon name="leaf" size={16} />Học theo nhịp của bạn</span></div>

      <div className="home__hero">
        <div className="home__hero-copy"><span className="home__hero-label"><span />GÓC TẬP TRUNG CỦA BẠN</span><h2>Từng từ nhỏ.<br /><span>Tiến bộ lớn.</span></h2><p>{hasWords ? due > 0 ? `Có ${due} từ đang chờ bạn ôn lại. Dành một chút thời gian để ghi nhớ lâu hơn nhé.` : 'Một phiên học ngắn, một chút tiến bộ. Bộ từ của bạn đã sẵn sàng.' : 'Biến những từ mới thành điều quen thuộc. Bắt đầu hành trình với bộ từ vựng của riêng bạn.'}</p><div className="home__hero-actions"><button className="btn is-primary" onClick={hasWords ? () => onPlay('flashcard') : onManage}>{hasWords ? 'Bắt đầu học' : 'Thêm bộ từ vựng'}<Icon name={hasWords ? 'arrow' : 'plus'} size={17} /></button>{hasWords ? <span><Icon name="clock" size={14} />{sessionSize} từ trong phiên này</span> : <button className="home__sample" onClick={loadSample} disabled={loading}>{loading ? 'Đang tải…' : 'Dùng thử bộ từ mẫu'}<Icon name="arrow" size={15} /></button>}</div></div>
        <div className="home__art" aria-hidden="true"><span className="home__art-orbit" /><span className="home__art-star home__art-star--one">✦</span><span className="home__art-star home__art-star--two">✧</span><div className="home__art-card home__art-card--back" /><div className="home__art-card home__art-card--front"><span className="home__art-card-top">a little word, a new world<Icon name="sound" size={13} /></span><Icon name="leaf" size={30} /><strong>grow</strong><span className="home__art-phonetic">/ɡroʊ/</span><span className="home__art-divider" /><span>lớn lên, phát triển</span><span className="home__art-example">A little better, every day.</span></div><div className="home__art-tag"><span><Icon name="check" size={14} /></span>Thêm một từ, thêm tự tin</div><span className="home__art-dots">· · ·</span></div>
      </div>
      {error && <p className="notice is-error" role="alert">{error}</p>}

      <div className="home__stats" aria-label="Thống kê bộ từ vựng">
        {[{ label: 'Tổng từ vựng', value: words.length, icon: 'book', className: 'green', note: 'Trong thư viện của bạn' }, { label: 'Đến hạn ôn', value: due, icon: 'clock', className: 'amber', note: 'Ghi nhớ tốt hơn khi ôn đúng lúc' }, { label: 'Từ mới', value: fresh, icon: 'spark', className: 'blue', note: 'Những điều đang chờ khám phá' }, { label: 'Đã ghi nhớ', value: learned, icon: 'check', className: 'purple', note: 'Từ đã đạt ngăn ôn tập 3 trở lên' }].map(stat => <div className="home__stat" key={stat.label}><div className="home__stat-top"><span>{stat.label}</span><span className={`home__stat-icon is-${stat.className}`}><Icon name={stat.icon as IconName} size={18} /></span></div><strong>{stat.value.toLocaleString('vi-VN')}<span>từ</span></strong><small>{stat.note}</small></div>)}
      </div>

      <div className="home__section-heading"><div><h2>Chọn cách bạn muốn học</h2><p>Một bộ từ vựng, nhiều cách để ghi nhớ.</p></div><span className="home__section-label">LUYỆN TẬP</span></div>
      <div className="home__games">
        {games.map(game => <button key={game.id} className="home__game is-available" onClick={() => hasWords ? onPlay(game.id) : onManage()}><div className="home__game-top"><span className="home__game-icon is-green"><Icon name="cards" size={25} /></span><span className="badge">Sẵn sàng học</span></div><h3>{game.name}</h3><p>Lật thẻ, nhớ từ. Đơn giản mà hiệu quả.</p><span className="home__game-bottom">{hasWords ? 'Bắt đầu luyện tập' : 'Thêm từ để bắt đầu'}<Icon name="arrow" size={17} /></span></button>)}
        {upcoming.map(game => <div key={game.name} className="home__game is-upcoming"><div className="home__game-top"><span className={`home__game-icon is-${game.theme}`}><Icon name={game.icon} size={25} /></span><span className="home__coming-badge">Sắp ra mắt</span></div><h3>{game.name}</h3><p>{game.description}</p><span className="home__game-bottom">Một cách học mới đang đến<Icon name="clock" size={15} /></span></div>)}
      </div>

      <div className="home__bottom-grid"><div className="home__collection"><div className="home__section-heading"><h2>Bộ từ của bạn</h2><button className="home__text-link" onClick={onManage}>Quản lý<Icon name="arrow" size={14} /></button></div><div className="home__deck"><span className="home__deck-icon"><Icon name="book" size={26} /></span><div className="home__deck-content"><strong>{hasWords ? deck?.name || 'Bộ từ vựng của tôi' : 'Câu chuyện bắt đầu từ một từ mới'}</strong><span>{hasWords ? `${words.length} từ vựng · ${studied} từ đã học` : 'Nhập bộ từ riêng hoặc khám phá bộ từ mẫu.'}</span>{hasWords && <div className="home__deck-track" role="progressbar" aria-label="Tỷ lệ từ đã học" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div>}</div><button className="home__deck-button" onClick={onManage} aria-label="Mở thư viện từ vựng"><Icon name={hasWords ? 'chevron' : 'plus'} size={19} /></button></div></div><div className="home__tip"><span className="home__tip-icon"><Icon name="spark" size={20} /></span><div><span className="eyebrow">MẸO NHỎ, NHỚ LÂU</span><h3>Học ít hơn. Nhớ lâu hơn.</h3><p>Ôn tập ngắt quãng giúp bạn gặp lại từ ngay trước khi quên. Cứ để Mầm chọn từ, bạn chỉ cần tập trung học.</p></div></div></div>
    </section>
  )
}
