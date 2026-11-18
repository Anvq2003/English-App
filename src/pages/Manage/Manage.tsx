import { useDeferredValue, useRef, useState, type DragEvent } from 'react'
import { DownloadButton } from '../../components/DownloadButton.tsx'
import { Icon } from '../../components/Icon/Icon.tsx'
import { SpeakButton } from '../../components/SpeakButton.tsx'
import type { ImportMode } from '../../core/deckIO.ts'
import { normalize } from '../../core/normalize.ts'
import { isDue, isNew } from '../../core/srs.ts'
import { useDeck } from '../../store/deckContext.ts'
import './style.css'

type Filter = 'all' | 'new' | 'due' | 'learned'
const filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'Tất cả' }, { id: 'new', label: 'Từ mới' }, { id: 'due', label: 'Đến hạn ôn' }, { id: 'learned', label: 'Đã ghi nhớ' }]

export function Manage() {
  const { deck, importText, resetProgress } = useDeck()
  const [mode, setMode] = useState<ImportMode>('merge')
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState('')
  const query = useDeferredValue(normalize(search))
  const [filter, setFilter] = useState<Filter>('all')
  const [visible, setVisible] = useState(30)
  const [now] = useState(() => Date.now())
  const fileRef = useRef<HTMLInputElement>(null)
  const words = deck?.words ?? []
  const matches = words.filter(w => {
    const matchesSearch = !query || normalize(`${w.word} ${w.meaning} ${(w.tags ?? []).join(' ')}`).includes(query)
    const matchesFilter = filter === 'all' || (filter === 'new' && isNew(w)) || (filter === 'due' && !isNew(w) && isDue(w, now)) || (filter === 'learned' && (w.progress?.box ?? 0) >= 3)
    return matchesSearch && matchesFilter
  })

  const importFile = async (file: File) => {
    if (busy) return
    setMessage('')
    setErrors([])
    if (mode === 'replace' && words.length && !confirm('Thay thế sẽ xoá toàn bộ từ vựng và tiến độ hiện tại. Tiếp tục?')) return
    setBusy(true)
    try {
      const result = importText(await file.text(), mode)
      setErrors(result)
      if (!result.length) {
        setMessage(`Đã nhập thành công “${file.name}”. Bộ từ của bạn đã sẵn sàng.`)
        setVisible(30)
      }
    } catch {
      setErrors(['Không đọc được file. Hãy kiểm tra file JSON và thử lại.'])
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void importFile(file)
  }
  const onReset = () => {
    if (confirm('Xoá toàn bộ tiến độ học? Từ vựng được giữ nguyên.')) {
      resetProgress()
      setErrors([])
      setMessage('Đã xoá tiến độ. Bạn có thể bắt đầu học lại từ đầu.')
    }
  }

  return (
    <section className="manage">
      <div className="manage__heading"><div><span className="eyebrow">TỪ VỰNG CỦA RIÊNG BẠN</span><h1>Thư viện từ vựng</h1><p>Gom những từ mới. Giữ lại những điều đã học.</p></div><DownloadButton /></div>
      <div className="manage__import-grid">
        <div className="manage__block"><div className="manage__block-heading"><span className="manage__block-icon"><Icon name="upload" size={19} /></span><div><h2>Thêm bộ từ vựng</h2><p>Một file JSON, cả hành trình học.</p></div></div><fieldset className="manage__modes"><legend className="manage__legend">Chọn cách nhập</legend><label className={mode === 'merge' ? 'is-selected' : ''}><input type="radio" name="mode" checked={mode === 'merge'} onChange={() => setMode('merge')} disabled={busy} /><span><strong>Gộp từ vựng</strong><small>Thêm từ mới, giữ tiến độ gần nhất</small></span></label><label className={mode === 'replace' ? 'is-selected' : ''}><input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} disabled={busy} /><span><strong>Thay thế bộ từ</strong><small>Thay toàn bộ dữ liệu hiện tại</small></span></label></fieldset><div className={`manage__dropzone ${dragging ? 'is-dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}><Icon name="upload" size={26} /><strong>{busy ? 'Đang đọc bộ từ vựng…' : 'Kéo thả file JSON vào đây'}</strong><span>hoặc chọn file từ thiết bị của bạn</span><button className="btn" disabled={busy} onClick={() => fileRef.current?.click()}><Icon name="plus" size={16} />Chọn file JSON</button><input ref={fileRef} className="manage__file-input" type="file" accept=".json,application/json" disabled={busy} aria-label="Chọn file từ vựng JSON" onChange={event => { const file = event.target.files?.[0]; if (file) void importFile(file) }} /></div><div className="manage__import-footer"><span>Chỉ lưu trên trình duyệt của bạn</span><a href={`${import.meta.env.BASE_URL}sample.json`} download><Icon name="download" size={13} />Tải file mẫu</a></div></div>
        <div className="manage__aside"><div className="manage__guide"><span className="eyebrow">MỘT CHÚT HƯỚNG DẪN</span><h2>Bộ từ, theo cách của bạn.</h2><p>Mỗi từ chỉ cần <code>word</code> (tiếng Anh) và <code>meaning</code> (nghĩa tiếng Việt). Thêm phiên âm, loại từ và tối đa 3 ví dụ nếu muốn.</p><details><summary>Xem cấu trúc JSON mẫu</summary><pre>{'{\n  "version": 1,\n  "name": "Từ vựng của tôi",\n  "words": [\n    {\n      "word": "grow",\n      "meaning": "lớn lên, phát triển"\n    }\n  ]\n}'}</pre></details></div><div className="manage__backup"><Icon name="shield" size={23} /><h3>Đừng quên một bản sao.</h3><p>File tải xuống chứa cả từ vựng và tiến độ. Hãy sao lưu trước khi đổi thiết bị hoặc xoá dữ liệu trình duyệt.</p><button className="manage__reset" disabled={!words.length || busy} onClick={onReset}><Icon name="refresh" size={14} />Xoá tiến độ học</button></div></div>
      </div>
      {errors.length > 0 && <div className="notice is-error" role="alert"><strong>Chưa nhập dữ liệu. Bạn kiểm tra lại nhé:</strong><ul>{errors.map((error, index) => <li key={index}>{error}</li>)}</ul></div>}
      {message && <p className="notice is-success" role="status"><Icon name="check" size={17} /> {message}</p>}
      <div className="manage__library"><div className="manage__library-heading"><div><h2>{deck?.name || 'Bộ từ vựng của tôi'}<span className="badge">{words.length} từ</span></h2><p>Những từ đang lớn lên cùng bạn.</p></div><label className="manage__search"><Icon name="search" size={17} /><input type="search" placeholder="Tìm từ, nghĩa hoặc thẻ…" aria-label="Tìm từ vựng" value={search} onChange={event => { setSearch(event.target.value); setVisible(30) }} /></label></div><div className="manage__filters" aria-label="Lọc từ vựng">{filters.map(item => <button className={filter === item.id ? 'is-active' : ''} aria-pressed={filter === item.id} key={item.id} onClick={() => { setFilter(item.id); setVisible(30) }}>{item.label}</button>)}</div>
        {!words.length ? <div className="manage__empty"><span><Icon name="book" size={35} /></span><h3>Một thư viện đang chờ được viết.</h3><p>Nhập file JSON ở phía trên để thêm những từ đầu tiên.</p></div> : !matches.length ? <div className="manage__empty"><Icon name="search" size={30} /><h3>Chưa tìm thấy từ phù hợp.</h3><p>Thử một từ khoá khác hoặc chọn bộ lọc “Tất cả”.</p><button className="btn" onClick={() => { setSearch(''); setFilter('all') }}>Xoá bộ lọc</button></div> : <><div className="manage__table-wrap"><table className="manage__table"><thead><tr><th>TỪ VỰNG</th><th>NGHĨA TIẾNG VIỆT</th><th>TRẠNG THÁI</th><th><span className="manage__sr-only">Phát âm</span></th></tr></thead><tbody>{matches.slice(0, visible).map(w => <tr key={normalize(w.word)}><td><strong>{w.word}</strong><span>{w.phonetic || w.pos || '—'}</span></td><td>{w.meaning}</td><td><span className={`badge ${isNew(w) ? 'is-new' : ''}`}>{isNew(w) ? 'Từ mới' : isDue(w, now) ? 'Đến hạn ôn' : (w.progress?.box ?? 0) >= 3 ? 'Đã ghi nhớ' : 'Đang học'}</span></td><td><SpeakButton text={w.word} /></td></tr>)}</tbody></table></div><div className="manage__table-footer"><span>Hiển thị {Math.min(visible, matches.length)} / {matches.length} từ</span>{matches.length > visible && <button className="btn" onClick={() => setVisible(value => value + 30)}>Xem thêm 30 từ<Icon name="plus" size={14} /></button>}</div></>}
      </div>
    </section>
  )
}
