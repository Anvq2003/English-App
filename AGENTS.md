# English-App — Tài liệu dự án

Web app học từ vựng tiếng Anh. Chạy hoàn toàn trên client, không backend, dữ liệu nằm ở máy user.

## 1. Mục tiêu & phạm vi

- Học từ vựng bằng nhiều mini-game, dùng chung 1 thuật toán ôn tập ngắt quãng (SRS).
- User tự cung cấp từ vựng bằng **1 file JSON**. Không có server, không có DB, không có tài khoản.
- Deploy miễn phí trên Vercel (static).
- **Ưu tiên PC + bàn phím vật lý**, responsive cơ bản. UI tiếng Việt.
- **Không làm ở v1:** gamification (combo, XP, mục tiêu hằng ngày), game bắn máy bay, mobile tối ưu.

## 2. Tech stack

- Vite + React + TypeScript (không React Compiler, không Next.js, không SSR).
- Lưu trữ: `localStorage` (bộ từ vựng nhỏ, đủ dùng). Có thể nâng lên IndexedDB nếu cần.
- State: React Context hoặc `zustand`, không Redux.
- Style: Tailwind hoặc CSS thuần (chốt khi scaffold).
- Phát âm: Web Speech API (`speechSynthesis`, `lang: en-US`). SFX tắt mặc định.
- Package manager: pnpm.

## 3. Kiến trúc: tách core khỏi game

```
src/
  core/            # không phụ thuộc UI/game
    types.ts       # Word, Progress, Deck
    normalize.ts   # chuẩn hoá chuỗi để so sánh / tạo id
    srs.ts         # Leitner engine: pickWords(), report()
    storage.ts     # đọc/ghi localStorage
    deckIO.ts      # import (replace | merge) / export JSON + validate
    speech.ts      # wrapper speechSynthesis
  games/
    registry.ts    # danh sách game: { id, name, component }
    flashcard/  cloze/  typing/  dictation/
  components/      # UI dùng chung
  pages/           # Home, Import/Export, màn chơi
```

Nguyên tắc:

- Mỗi game chỉ dùng 2 thứ từ core: `pickWords(n)` để lấy từ cần ôn, và `report({ wordId, correct, timeMs })` để báo kết quả.
- Game không tự ghi storage, không tự tính SRS.
- Thêm game mới = thêm 1 thư mục trong `games/` + 1 dòng trong `registry.ts`.

## 4. Dữ liệu

### 4.1 Một file JSON duy nhất (vocab + progress)

```json
{
  "version": 1,
  "name": "IELTS Basic",
  "words": [
    {
      "word": "abandon",
      "meaning": "từ bỏ, bỏ rơi",
      "phonetic": "/əˈbændən/",
      "pos": "verb",
      "examples": [
        { "en": "He abandoned his plan.", "vi": "Anh ấy từ bỏ kế hoạch của mình." }
      ],
      "altAnswers": ["abandons", "abandoned", "abandoning"],
      "tags": ["ielts"],
      "progress": {
        "seen": 5,
        "wrong": 2,
        "streak": 1,
        "box": 2,
        "lastSeen": "2026-10-19T08:00:00Z",
        "nextDue": "2026-10-22T08:00:00Z"
      }
    }
  ]
}
```

- **Bắt buộc:** `word`, `meaning`.
- **Tuỳ chọn:** `phonetic`, `pos`, `examples` (tối đa 3), `altAnswers`, `tags`, `progress`.
- File user viết tay hoặc AI sinh ra có thể bỏ `progress`. App tự khởi tạo.
- Khi export, file chứa cả vocab lẫn progress. Đây cũng là bản backup.
- Mọi field lạ phải được **giữ nguyên** khi import rồi export, để mở rộng schema về sau mà không mất dữ liệu.
- `version` dùng cho migration về sau.

### 4.2 Progress mỗi từ

- `seen`: số lần gặp.
- `wrong`: số lần sai.
- `streak`: số lần đúng liên tiếp.
- `box`: ngăn Leitner (0..5).
- `lastSeen`, `nextDue`: ISO string.

### 4.3 Chuẩn hoá & định danh

- `id` của từ = `normalize(word)`: lowercase, trim, gộp khoảng trắng, bỏ dấu (NFD).
- Hai từ có cùng `id` coi là **một từ** (chống trùng khi import).
- So khớp đáp án: `normalize(input) === normalize(word)` hoặc nằm trong `altAnswers` (cũng đã normalize). Không phân biệt hoa/thường.

### 4.4 Import / Export

- Hai chế độ import: **Thay thế** (xoá hết dữ liệu cũ) hoặc **Gộp** (cộng vào dữ liệu cũ theo `id`).
- Gộp: nội dung từ (nghĩa, ví dụ...) lấy từ file mới. Progress giữ bản có `lastSeen` mới hơn.
- Validate khi import: thiếu `word`/`meaning`, `examples` quá 3, JSON sai cú pháp thì báo lỗi rõ ràng, không import một phần âm thầm.
- Có nút **Xoá tiến độ** (reset progress), luôn kèm confirm.
- Có nút **Download JSON** để backup (khi kết thúc game và trong trang quản lý).

## 5. SRS (Leitner đơn giản)

- Khoảng ôn theo `box`: `[0, 1, 3, 7, 14, 30]` ngày.
- Đúng: `box + 1`, `streak + 1`. Sai: `box = 0`, `streak = 0`, `wrong + 1`. Mỗi lần gặp: `seen + 1`, cập nhật `lastSeen` và `nextDue`.
- Chọn từ cho 1 phiên, theo thứ tự ưu tiên:
  1. Từ đến hạn (`nextDue <= now`), từ hay sai (`wrong/seen` cao) lên trước.
  2. Từ mới (chưa có progress), giới hạn số từ mới mỗi phiên.
  3. Từ chưa đến hạn chỉ dùng khi thiếu từ để đủ phiên, ưu tiên `box` thấp.
- Từ `box` cao xuất hiện thưa dần.
- Mặc định 1 phiên = 20 từ, tối đa 10 từ mới.

## 6. Game (4 game ở giai đoạn đầu)

Thứ tự làm: **Flashcard → Gõ theo nghĩa → Nghe và gõ → Điền chỗ trống**.

### 6.1 Flashcard (làm trước)

- **Mặt trước:** từ tiếng Anh, kèm nút phát âm.
- **Mặt sau:** nghĩa tiếng Việt, phiên âm, tối đa 3 câu ví dụ (mỗi câu gồm EN và bản dịch VI nếu có).
- User lật thẻ rồi tự chấm: **Biết** (đúng) hoặc **Chưa biết** (sai). Kết quả gọi `report()`.
- Phím tắt: `Space` lật thẻ, `1`/`←` chưa biết, `2`/`→` biết.
- Kết thúc phiên: hiện tổng kết (số từ, đúng/sai, từ sai nhiều nhất) và nút download JSON.

### 6.2 Gõ theo nghĩa

- Hiện nghĩa, user gõ từ tiếng Anh, so khớp theo §4.3.
- Gợi ý dần: chữ cái đầu, rồi số chữ cái. Dùng gợi ý thì tính là sai.

### 6.3 Nghe và gõ

- Phát âm bằng Web Speech API, user gõ lại từ. Có nút nghe lại.
- Nếu trình duyệt không có voice tiếng Anh thì báo rõ và ẩn game này.

### 6.4 Điền chỗ trống

- Lấy 1 câu ví dụ `en`, che từ cần học (hoặc biến thể trong `altAnswers`), user gõ từ vào chỗ trống.
- Từ không có ví dụ chứa từ đó thì bỏ qua trong game này.

## 7. Quy ước code

- Ưu tiên đơn giản, không over-engineering. Chỉ thêm abstraction khi có ít nhất 2 chỗ dùng.
- TypeScript strict. Logic ở `core/` phải thuần (pure function), dễ test.
- Test logic `core/` bằng Vitest (normalize, srs, deckIO). UI không bắt buộc test ở v1.
- Mọi thao tác storage/import có try/catch. Khi `localStorage` không dùng được thì app vẫn chạy và cảnh báo user.
- Chuỗi UI tiếng Việt. Tên biến, comment kỹ thuật bằng tiếng Anh.

## 8. Câu hỏi còn mở

- Flashcard dùng 2 nút (Biết / Chưa biết) hay 3 nút (thêm Mơ hồ)? Mặc định hiện tại: 2 nút.
- Flashcard có cần đảo chiều (hiện nghĩa trước, đoán từ) không? Mặc định: chưa.
- Câu ví dụ có kèm bản dịch tiếng Việt không (`vi`)? Mặc định: có, nhưng tuỳ chọn.
- Một từ nhiều nghĩa: `meaning` là 1 chuỗi (ngăn cách bằng dấu phẩy) hay mảng? Mặc định: 1 chuỗi.
- Ai tạo file từ vựng: user viết tay hay nhờ AI sinh? Nếu nhờ AI, cần thêm prompt mẫu trong app.
- Từ biến thể (abandoned, abandons) trong game Điền chỗ trống: dùng `altAnswers` có đủ không?
