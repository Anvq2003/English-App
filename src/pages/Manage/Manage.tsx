import { useState, type ChangeEvent } from 'react'
import { DownloadButton } from '../../components/DownloadButton.tsx'
import type { ImportMode } from '../../core/deckIO.ts'
import { useDeck } from '../../store/deckContext.ts'
import './style.css'

export function Manage() {
  const { deck, importText, resetProgress } = useDeck()
  const [mode, setMode] = useState<ImportMode>('merge')
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return
    setMessage('')
    if (mode === 'replace' && deck && !confirm('Thay thế sẽ xoá toàn bộ từ vựng và tiến độ hiện tại. Tiếp tục?')) {
      input.value = ''
      return
    }
    let text: string
    try {
      text = await file.text()
    } catch {
      setErrors(['Không đọc được file.'])
      input.value = ''
      return
    }
    const result = importText(text, mode)
    setErrors(result)
    if (result.length === 0) setMessage(`Đã import "${file.name}".`)
    input.value = ''
  }

  const onReset = () => {
    if (confirm('Xoá toàn bộ tiến độ học? Từ vựng được giữ nguyên.')) {
      resetProgress()
      setMessage('Đã xoá tiến độ.')
    }
  }

  return (
    <section className="manage">
      <h1>Quản lý từ vựng</h1>

      <div className="manage__block">
        <h2>Import</h2>
        <div className="manage__modes">
          <label>
            <input type="radio" name="mode" checked={mode === 'merge'} onChange={() => setMode('merge')} /> Gộp (giữ từ
            cũ, cập nhật theo file mới)
          </label>
          <label>
            <input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} /> Thay thế
            (xoá dữ liệu cũ)
          </label>
        </div>
        <input type="file" accept=".json,application/json" onChange={onFile} />
        <p>
          <a href="/sample.json" download>
            Tải file mẫu
          </a>
        </p>
        {errors.length > 0 && (
          <div className="notice is-error" role="alert">
            <strong>Import thất bại, chưa có gì thay đổi:</strong>
            <ul>
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {message && <p className="manage__message">{message}</p>}
      </div>

      <div className="manage__block">
        <h2>Backup &amp; tiến độ</h2>
        <div className="manage__actions">
          <DownloadButton />
          <button type="button" className="btn is-bad" disabled={!deck} onClick={onReset}>
            Xoá tiến độ
          </button>
        </div>
      </div>
    </section>
  )
}
