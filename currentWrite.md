# 🧭 CURRENT WRITE — NHẬT KÝ TIẾN ĐỘ & BÀN GIAO CHO CÁC AI KHÁC

> **Đây là bản ghi trạng thái SỐNG của dự án CareVault.**
> Bất kỳ AI agent nào nhận việc trong repo này **PHẢI đọc file này TRƯỚC khi hành động** và **PHẢI cập nhật nó NGAY SAU mỗi lần sửa code**.

| | |
|---|---|
| **Dự án** | CareVault — Patient-Sovereign Health Vault (RMIT Hackathon 2026 – Challenge 2) |
| **Repository** | https://github.com/congnghetinhtu/hackathon |
| **Hạn nộp bài** | **18:00 (GMT+7) ngày 22/10/2026** |
| **Múi giờ chuẩn của file này** | GMT+7 (Asia/Ho_Chi_Minh) |
| **Trạng thái file** | 🟢 ACTIVE — append-only, không được xoá lịch sử |

---

## 1. 📜 PROTOCOL BẮT BUỘC CHO MỌI AI (ĐỌC TRƯỚC, LÀM SAU)

### 1.1. Quy trình 3 bước

```
[1] ĐỌC   → Mở currentWrite.md, nắm trạng thái + việc dang dở ở mục 7
[2] LÀM    → Sửa code. TUYỆT ĐỐI không sửa file này cho đến khi code đã xong
[3] GHI    → Quay lại currentWrite.md, thêm 1 mục vào NHẬT KÝ CAN THIỆP (mục 4)
              + cập nhật TRẠNG THÁI HIỆN TẠI (mục 2) + HÀNH ĐỘNG TIẾP THEO (mục 7)
```

### 1.2. Luật bất di bất dịch

1. **Append-only.** Chỉ được *thêm* mục mới vào nhật ký. Tuyệt đối **không xoá, không sửa, không viết lại** các mục lịch sử cũ (kể cả mục của AI khác).
2. **Mỗi lần can thiệp = 1 mục.** Một "can thiệp" (intervention) là một phiên làm việc liên tục có mục tiêu thống nhất. Đánh số liên tục `#1, #2, #3...`.
3. **Ghi khoảng cách giữa các lần can thiệp.** Cột `Khoảng cách` = thời gian trôi qua từ can thiệp trước tới can thiệp này (ví dụ `+2h15m`, `+45s`). Mục đầu tiên ghi `—`. Đây là chỉ số giúp thấy nhịp làm việc và phát hiện chỗ bị bỏ rơi.
4. **Ghi kèm thay đổi.** Mỗi mục phải nêu: file nào bị tạo/sửa/xoá, và **kết quả kiểm chứng** (test pass? chạy thật chưa? chỉ mới viết?).
5. **Khai báo trung thực trạng thái.** Nếu viết code nhưng **chưa chạy/chưa test**, phải ghi rõ `⚠️ CHƯA KIỂM CHỨNG`. Không được ghi "đã xong" cho thứ chưa xong.
6. **Timestamp theo GMT+7.** Lấy bằng: `TZ=Asia/Ho_Chi_Minh date "+%Y-%m-%d %H:%M"`.
7. **Cập nhật mục 2 và 7.** Mỗi lần ghi nhật ký phải đồng bộ lại trạng thái tổng thể và hàng đợi công việc tiếp theo, để AI kế tiếp đọc là chạy được ngay.
8. **Không để file này lệch thực tế.** Nếu phát hiện mục cũ sai, ghi thêm mục đính chính mới — tuyệt đối không sửa lịch sử.

### 1.3. Mẫu ghi (copy nguyên văn khi thêm mục)

```markdown
### #N — <Tiêu đề ngắn gọn> · <YYYY-MM-DD HH:MM> GMT+7 · <+Xh Ym kể từ #N-1>

| | |
|---|---|
| **AI / Session** | <tên model hoặc vai trò> |
| **Loại** | <Tạo file | Sửa code | Fix bug | Tài liệu | Test | Review> |
| **Files touched** | `path/a.ts`, `path/b.tsx` (+2 mới) |

**Đã làm**
- ...

**Kiểm chứng**
- <lệnh đã chạy + kết quả> | ⚠️ CHƯA KIỂM CHỨNG

**Khoảng cách so với lần trước:** +Xh Ym
```

---

## 2. 📍 TRẠNG THÁI HIỆN TẠI (SNAPSHOT)

> Cập nhật mục này ở mỗi lần can thiệp. Đây là phần AI mới đọc đầu tiên.

| Hạng mục | Trạng thái | Tiến độ |
|---|---|---|
| **1. Khung tài liệu quản trị (`Docs/`)** | 🟢 Xong | 100% |
| **2. File nhật ký AI (`currentWrite.md`)** | 🟢 Xong | 100% |
| **3. Quy tắc agent (`AGENTS.md`)** | 🟢 Xong | 100% |
| **4. Mã nguồn ứng dụng (React + Vite)** | ⚪ Chưa bắt đầu | 0% |
| **5. Dữ liệu y tế giả lập (`seed.json`)** | ⚪ Chưa bắt đầu | 0% |
| **6. Test tự động (Vitest)** | ⚪ Chưa bắt đầu | 0% |
| **7. `README.md` (5 tiêu chí chấm điểm)** | ⚪ Chưa bắt đầu | 0% |
| **8. `Video.mp4` (<2 phút)** | ⚪ Chưa bắt đầu | 0% |
| **9. Nộp bài Google Form** | ⚪ Chưa bắt đầu | 0% |

**Cấu trúc thư mục hiện tại:**

```
hackathon/
├── currentWrite.md      ← file này (nhật ký sống)
├── AGENTS.md            ← quy tắc bắt buộc cho mọi AI agent
└── Docs/
    ├── startAndStop.md  (58 dòng)
    ├── demoScript.md    (48 dòng)
    ├── reason.md        (63 dòng)
    ├── progress.md      (50 dòng)
    └── skillDefine.md   (85 dòng — đã thêm dòng trỏ xuất ở #1)
```

**Ghi chú vận hành:**
- ⚠️ **Chưa phải git repo** (chưa `git init`), dù tài liệu trỏ tới `github.com/congnghetinhtu/hackathon`.
- ⚠️ **Chưa có `package.json`, `src/`, `seed.json`** — toàn bộ phần ứng dụng chưa viết.
- ✅ Môi trường sẵn có: Node `v26.12.0`, npm `11.20.0`, Docker `29.9.1`, Python `3.15.0`.
- ✅ `AGENTS.md` đã được harness nạp — mọi AI mở repo này đều tự động nhận quy tắc "sửa code xong phải ghi `currentWrite.md`".

---

## 3. 📖 ĐÃ ĐỌC GÌ (READ INVENTORY)

> Những gì đã được đọc hiểu trong dự án. AI mới nên đọc lại các file này nếu nghi ngờ nội dung.

| File | Dòng | Nội dung then chốt đã nắm |
|---|---:|---|
| `Docs/reason.md` | 63 | Bài toán "được ăn cả, ngã về không" trong hồ sơ bệnh án điện tử; nạn "Admin God-Mode"; 4 công năng cốt lõi (E2EE theo phiên, Selective Disclosure, Instant Revocation, Quorum 2/3); bám pháp lý: Luật Khám bệnh chữa bệnh VN 2023 Điều 69, HIPAA, GDPR Art. 9. |
| `Docs/startAndStop.md` | 58 | 4 giai đoạn + tiêu chí Start/Stop từng giai đoạn; tiêu chí thoát GĐ2 (4 tính năng + audit trail), GĐ3 (`npm test` 100%, console sạch, 3 kịch bản red-team), GĐ4 (`README.md` đủ 5 tiêu chí, `Video.mp4` 1:50–1:58, push, submit form). |
| `Docs/skillDefine.md` | 83 | Guardrails cho 8 nhóm skill: cấm rõ PII/PHI thật, cấm smart contract thật, cấm UI lib nặng, cấm Prometheus/Datadog/OTel backend, cấm backend phân tán thật, cấm README sơ sài. Tên hàm cần test: `canDecryptRecord()`, `revokeAccess()`, `quorumVote()`, `preventUnilateralOverride()`. |
| `Docs/demoScript.md` | 48 | Kịch bản video 1:55 gồm 4 phân đoạn + lời thoại tiếng Việt sẵn: (1) bối cảnh 0:00–0:30, (2) selective disclosure 0:30–0:55, (3) zero-knowledge admin 0:55–1:25, (4) revocation + quorum 1:25–1:55. |
| `Docs/progress.md` | 50 | Bảng tiến độ cũ (Docs 80%, tất cả mục khác 0%) — **cần đồng bộ lại khi code bắt đầu**. |

---

## 4. 📖 NHẬT KÝ CAN THIỆP (APPEND-ONLY)

> **Không xoá mục cũ.** Thêm mới ở cuối. Mỗi mục ghi rõ khoảng cách từ mục trước.

| # | Thời điểm (GMT+7) | Khoảng cách | AI | Loại | Kết quả |
|---|---|---|---|---|---|
| **#1** | 2026-10-22 12:01 | — | OpenCode (MiniMax M3.1 Flash) | Khảo sát + Tạo file | ✅ Hoàn tất |
| **#2** | 2026-10-22 12:05 | **+3m** | OpenCode (MiniMax M3.1 Flash) | Tạo file (harness rule) | ✅ Hoàn tất |

---

### #1 — Khảo sát toàn bộ dự án & Khởi tạo nhật ký AI · 2026-10-22 12:01 GMT+7 · — (mục đầu tiên)

| | |
|---|---|
| **AI / Session** | OpenCode — `MiniMax M3.1 Flash Free` (opencode/minimax-m3.1-flash-free) |
| **Loại** | Khảo sát codebase + Tạo tài liệu (`currentWrite.md`) |
| **Files touched** | `currentWrite.md` (+1 mới), `Docs/skillDefine.md` (+1 dòng trỏ xuất) |

**Đã làm**
- Quét toàn bộ cây thư mục: dự án chỉ có **5 file Markdown** trong `Docs/`, **chưa có một dòng code nào**, chưa phải git repo.
- Đọc và tóm tắt toàn bộ 5 tài liệu (chi tiết ở mục 3).
- Đối chiếu `startAndStop.md` với `progress.md`: mới xong GĐ1 (tài liệu), GĐ2–GĐ4 còn nguyên.
- Tạo `currentWrite.md` — file nhật ký sống + protocol bắt buộc cho mọi AI agent tiếp theo.
- Thêm dòng trỏ xuất vào `Docs/skillDefine.md` để các AI tìm thấy file nhật ký khi đọc guardrails.

**Kiểm chứng**
- `find . -type f` → xác nhận 5 file docs, 0 file code.
- `git status` → `fatal: not a git repository`.
- `node -v / npm -v / docker -v` → `v26.12.0` / `11.20.0` / `29.9.1`.

**Khoảng cách so với lần trước:** — (mục đầu tiên)

---

### #2 — Thiết lập cơ chế bàn giao cho các AI khác (AGENTS.md) · 2026-10-22 12:05 GMT+7 · +3m

| | |
|---|---|
| **AI / Session** | OpenCode — `MiniMax M3.1 Flash Free` (opencode/minimax-m3.1-flash-free) |
| **Loại** | Tạo file (harness rule cho agent) |
| **Files touched** | `AGENTS.md` (+1 mới), `currentWrite.md` (§4, §2, §7 cập nhật) |

**Đã làm**
- Tạo `AGENTS.md` ở thư mục gốc — file quy tắc mà **các agent harness tự động nạp** (OpenCode/Claude Code/Cursor đều đọc `AGENTS.md`). Đây là cách chắc chắn nhất để "các AI khác cũng viết file này sau mỗi lần sửa code" — không chỉ dựa vào nhờ nhớ.
- `AGENTS.md` gồm 3 nhóm quy tắc:
  1. **Bắt buộc** — ĐỌC `currentWrite.md` trước → LÀM → GHI 1 mục vào §4 sau mỗi lần sửa code; có ghi khoảng cách giữa các lần can thiệp; append-only; phải khai báo trung thực `⚠️ CHƯA KIỂM CHỨNG`.
  2. **Ràng buộc phạm vi** — cấm PII/PHI thật, cấm smart contract thật, cấm UI lib nặng/OTel/backend phân tán, cấm tự nhận chứng chỉ pháp lý.
  3. **Cổng chất lượng** — `npm test` pass 100%, console 0 lỗi đỏ, đủ 4 hàm nghiệp vụ, không lọt plaintext vào storage.
- Kèm bản đồ tài liệu để agent mới biết đọc file nào cho việc nào.

**Kiểm chứng**
- `ls -la` → xác nhận `AGENTS.md` (3291 B) và `currentWrite.md` (13418 B) tồn tại ở thư mục gốc.
- `wc -l` → `currentWrite.md` 213 dòng, `AGENTS.md` 54 dòng, `Docs/skillDefine.md` 85 dòng (tăng 2 dòng từ 83 do thêm dòng trỏ xuất ở #1).
- ✅ Harness đã nạp `AGENTS.md` — nhận được system-update xác nhận nội dung file được áp dụng.

**Khoảng cách so với lần trước:** **+3m** (12:01 → 12:05)

---

## 5. 🔒 QUYẾT ĐỊNH & RÀNG BUỘC ĐÃ CHỐT (KHÔNG MỞ LẠI)

> Ghi lại để các AI sau không đề xuất ngược lại hoặc lãng phí thời gian tranh luận.

| # | Quyết định / Ràng buộc | Nguồn |
|---|---|---|
| D1 | Chỉ dùng **dữ liệu bệnh án giả lập (synthetic)**. Tuyệt đối không dùng PII/PHI thật. | `skillDefine.md` §5 |
| D2 | Không triển khai smart contract thật lên mạng Tide; chỉ mô phỏng hành vi quorum trong app. | `skillDefine.md` §5 |
| D3 | Stack UI: React + Vite + Tailwind, **không UI library nặng** (tránh vỡ bundle Vite). | `skillDefine.md` §3 |
| D4 | Audit trail là **in-app console log**, không cài Prometheus/Datadog/OTel backend. | `skillDefine.md` §4 |
| D5 | Không viết backend/database phân tán thật — bản mẫu hackathon chạy được local. | `skillDefine.md` §2 |
| D6 | Tên hàm nghiệp vụ phải test (Vitest): `canDecryptRecord()`, `revokeAccess()`, `quorumVote()`, `preventUnilateralOverride()`. | `skillDefine.md` §7 |
| D7 | README phải trả lời **đủ 5 tiêu chí chấm điểm** + badge `Built with TideCloak`; không được sơ sài. | `skillDefine.md` §8 |
| D8 | Tuyên bố tuân thủ pháp lý phải ghi rõ là **architectural compliance**, không tự nhận chứng chỉ pháp lý. | `skillDefine.md` §6 |
| D9 | `npm test` phải pass 100% khi giám khảo clone repo — không được có test flaky/failing. | `startAndStop.md` GĐ3 |
| D10 | Video demo **tối đa 2 phút**, đặt trực tiếp ở thư mục gốc repo (`Video.mp4`). | `startAndStop.md` GĐ4 |

---

## 6. 🎭 NHÂN VẬT & DỮ LIỆU MẪU (tóm tắt để AI sau dùng cho seed)

| Vai trò | Định danh | Chuyên khoa / Phạm vi |
|---|---|---|
| Bệnh nhân | **Nguyễn Thị Lan** | Chủ sở hữu hồ sơ |
| Bác sĩ Tim mạch | **BS. Trần Văn Minh** | Chỉ mở được hồ sơ tim mạch + ECG |
| Bác sĩ Tâm lý | **BS. Lê Hoàng An** | Chỉ mở được hồ sơ tâm lý |
| Bác sĩ Chấn thương | *(X-Quang)* | Chỉ mở được phim X-Quang |
| Quản trị viên | **SysAdmin Bệnh viện** | Chỉ thấy ciphertext — không có master-key |

**3 hồ sơ bệnh án cần có trong `seed.json`:**
1. Kết quả Điện tâm đồ Tim mạch (ECG) — có biểu đồ nhịp tim động.
2. Bệnh án Trị liệu Tâm lý Nhạy cảm.
3. Phim X-Quang chấn thương.

**4 mã log audit trail cần bắn ra:**
`[E2EE_ENCRYPT_CLIENT]`, `[SESSION_DECRYPT_SUCCESS]`, `[REVOKE_ACCESS_TRIGGERED]`, `[UNILATERAL_OVERRIDE_PREVENTED]`, `[ZERO_KNOWLEDGE_PRESERVED]`.

---

## 7. 📋 HÀNH ĐỘNG TIẾP THEO (HÀNG ĐỢI)

> AI mới đọc xong hãy chọn hạng mục đầu tiên ở trạng thái ⚪, làm theo mục 1 protocol, rồi quay lại cập nhật mục này.

| Ưu tiên | Việc | Phụ thuộc | Trạng thái |
|:---:|---|---|---|
| **P0** | Khởi tạo project: Vite + React + Tailwind, cấu trúc thư mục, `package.json`, script `dev`/`test`/`build` | — | ⚪ Chưa bắt đầu |
| **P0** | Tạo `src/data/seed.json` — 3 hồ sơ bệnh án + DS bác sĩ/bệnh nhân/admin theo mục 6 | P0 (khung dự án) | ⚪ Chưa bắt đầu |
| **P0** | Lõi mã hóa E2EE client-side (WebCrypto) + `canDecryptRecord()` | P0 | ⚪ Chưa bắt đầu |
| **P1** | Switch Role (1 click) + màn hình chính bệnh nhân | P0 | ⚪ Chưa bắt đầu |
| **P1** | Selective Disclosure: cấp quyền theo chuyên khoa + màn hình "Access Denied by TideCloak" | P0 | ⚪ Chưa bắt đầu |
| **P1** | Zero-Knowledge Admin: tab "Database Raw View" hiển thị ciphertext | P0 | ⚪ Chưa bắt đầu |
| **P1** | Instant Revocation: nút "Thu hồi quyền" + khoá ngay | P1 | ⚪ Chưa bắt đầu |
| **P1** | Quorum Governance: `quorumVote()` chặn hành động đơn phương (cần ≥2/3) | P0 | ⚪ Chưa bắt đầu |
| **P1** | Live Cryptographic Audit Trail (in-app log real-time) | P0 | ⚪ Chưa bắt đầu |
| **P2** | Biểu đồ ECG động + thẻ hồ sơ bảo mật lật Locked/Decrypted | P1 | ⚪ Chưa bắt đầu |
| **P2** | Test Vitest cho 4 hàm nghiệp vụ — pass 100% | P0/P1 | ⚪ Chưa bắt đầu |
| **P2** | `git init` + commit + push lên `congnghetinhtu/hackathon` | P0 | ⚪ Chưa bắt đầu |
| **P2** | `README.md` đủ 5 tiêu chí + badge + hướng dẫn chạy | — | ⚪ Chưa bắt đầu |
| **P3** | Quay `Video.mp4` (theo `Docs/demoScript.md`, 1:50–1:58) | P1/P2 | ⚪ Chưa bắt đầu |
| **P3** | Submit Google Form `https://forms.gle/HRHYjnqB86j1LFS97` | — | ⚪ Chưa bắt đầu |

---

## 8. 🔑 NHẮC NHỞ NHANH

- **Không được bỏ qua `currentWrite.md`.** Mỗi lần sửa code → thêm 1 mục ở mục 4.
- **Deadline 18:00 hôm nay.** Ưu tiên P0/P1 trước, P2/P3 sau.
- **Test phải chạy được bằng `npm test`** — giám khảo sẽ clone repo và chạy.
- **Console phải sạch 0 lỗi đỏ** khi mở DevTools.
- **Dữ liệu chỉ là giả lập.**
- Nếu phải dừng giữa chừng, **ghi lại vào mục 7** việc đang dở và trạng thái cụ thể — đừng để lại "một ý tưởng chung chung".
