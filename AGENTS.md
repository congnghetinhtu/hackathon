# AGENTS.md — Quy tắc bắt buộc cho mọi AI agent làm việc trong repo này

Repo này là **CareVault** (RMIT Hackathon 2026 – Challenge 2). Deadline nộp bài: **18:00 (GMT+7) ngày 22/10/2026**.

## 🔴 Quy tắc số 1 — BẮT BUỘC

**Mỗi lần sửa code, bạn BẮT BUỘC cập nhật `currentWrite.md` ở thư mục gốc.**

```
[1] ĐỌC   → currentWrite.md  (bắt buộc, TRƯỚC khi làm bất cứ việc gì)
[2] LÀM    → sửa code
[3] GHI    → currentWrite.md, thêm 1 mục vào §4 NHẬT KÝ CAN THIỆP
```

Cụ thể phải làm:

1. **Đọc `currentWrite.md` trước.** Nắm trạng thái hiện tại (§2), những gì đã đọc (§3), quyết định đã chốt (§5), và hàng đợi việc tiếp theo (§7).
2. **Sau mỗi lần sửa code → ghi 1 mục mới** vào §4. Không gộp nhiều thay đổi không liên quan vào một mục.
3. **Ghi khoảng cách giữa các lần can thiệp** — cột `Khoảng cách` = thời gian từ mục trước tới mục này (ví dụ `+2h15m`).
4. **Ghi kèm kiểm chứng**: đã chạy lệnh gì, kết quả ra sao. Chưa chạy thì ghi `⚠️ CHƯA KIỂM CHỨNG` — không được ghi "đã xong" cho thứ chưa xong.
5. **Đồng bộ §2** (trạng thái) và **§7** (hàng đợi) sau mỗi lần ghi.
6. **Append-only.** Không xoá, không sửa, không viết lại lịch sử các mục cũ (kể cả của AI khác). Muốn đính chính thì thêm mục mới.

Mẫu ghi nằm ở `currentWrite.md` §1.3.

## 🔴 Quy tắc số 2 — RÀNG BUỘC PHẠM VI

Tuân thủ `Docs/skillDefine.md` (guardrails cho từng skill). Cụ thể các điều KHÔNG được phá:

- ❌ Dùng **PII/PHI thật** — chỉ dùng dữ liệu bệnh án **giả lập** (`src/data/seed.json`).
- ❌ Triển khai smart contract thật lên mạng Tide — chỉ mô phỏng quorum trong app.
- ❌ Thêm UI library nặng (tránh vỡ bundle Vite), Prometheus/Datadog/OTel backend, backend/database phân tán thật.
- ❌ Bỏ sót tiêu chí trong `README.md`, để sót file `.env`/file rác trong repo.
- ❌ Tự nhận CareVault đã có chứng chỉ pháp lý (chỉ được nói "tuân thủ về mặt kiến trúc").

## 🔴 Quy tắc số 3 — CỔNG CHẤT LƯỢNG (điều kiện nghiệm thu)

Theo `Docs/startAndStop.md`:

- `npm test` phải **pass 100%** — giám khảo sẽ clone repo và chạy.
- Console trình duyệt: **0 lỗi đỏ** trong DevTools.
- Phải test được 4 hàm nghiệp vụ: `canDecryptRecord()`, `revokeAccess()`, `quorumVote()`, `preventUnilateralOverride()`.
- Dữ liệu **không** được lọt plaintext vào `localStorage`/`sessionStorage`.

## 📁 Bản đồ tài liệu

| File | Vai trò |
|---|---|
| `currentWrite.md` | **Nhật ký sống + handoff.** Đọc đầu tiên, cập nhật sau mỗi lần sửa code. |
| `Docs/reason.md` | Bài toán, 4 công năng cốt lõi, giá trị xã hội, căn cứ pháp lý |
| `Docs/startAndStop.md` | 4 giai đoạn + tiêu chí Start/Stop |
| `Docs/skillDefine.md` | Scope & guardrails từng skill |
| `Docs/demoScript.md` | Kịch bản video demo 2 phút (kèm lời thoại) |
| `Docs/progress.md` | Bảng tiến độ tổng thể |
