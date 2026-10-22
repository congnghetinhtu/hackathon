# ⏱️ QUY TRÌNH BẮT ĐẦU & KẾT THÚC (START & STOP CRITERIA)

> **Mục tiêu:** Thiết lập các tiêu chuẩn kích hoạt (Start Triggers), tiêu chí nghiệm thu (Stop Criteria), và cổng chất lượng (Quality Gates) cho từng giai đoạn của dự án CareVault nhằm cán đích hoàn hảo trước 18:00 (VN) ngày 22/10/2026.

---

## 🚦 CÁC GIAI ĐOẠN THỰC THI (WORKFLOW STAGES)

```
[Giai đoạn 1: Chuẩn bị & Đặc tả] ──► [Giai đoạn 2: Lập trình Ứng dụng]
                 │                                      │
                 ▼                                      ▼
[Giai đoạn 3: Kiểm thử TDD & Bảo mật] ──► [Giai đoạn 4: Quay Demo & Nộp bài]
```

---

### GIAI ĐOẠN 1: KHỞI TẠO & ĐẶC TẢ HỆ THỐNG
* **Điều kiện Bắt đầu (Start Condition):**
  * Đã thống nhất ý tưởng CareVault (Hồ sơ y tế tự chủ bảo mật với TideCloak).
  * Repo trống `https://github.com/congnghetinhtu/hackathon` đã sẵn sàng.
* **Tiêu chuẩn Hoàn thành (Stop / Exit Criteria):**
  * Thư mục `Docs/` có đầy đủ: `progress.md`, `skillDefine.md`, `startAndStop.md`, `reason.md`, `demoScript.md`.
  * Bộ dữ liệu y tế giả lập `seed.json` được định nghĩa chuẩn xác (Gồm 3 hồ sơ bệnh án: Tim mạch, Tâm lý, X-Quang chấn thương; và danh sách Bác sĩ, Bệnh nhân, Admin).

---

### GIAI ĐOẠN 2: LẬP TRÌNH ỨNG DỤNG (VIBE CODING)
* **Điều kiện Bắt đầu (Start Condition):**
  * Hoàn thành Giai đoạn 1. Khởi tạo project React + Vite + `@tidecloak/react`.
* **Tiêu chuẩn Hoàn thành (Stop / Exit Criteria):**
  * Ứng dụng chạy mượt mà tại `http://localhost:5173/` không có lỗi runtime.
  * Tính năng **Selective Disclosure (Phân quyền chuyên khoa)** hoạt động: Bác sĩ Tim mạch chỉ mở được hồ sơ tim; thử mở hồ sơ tâm lý sẽ bị từ chối.
  * Tính năng **Instant Revocation (Thu hồi quyền)** hoạt động: Bệnh nhân bấm "Thu hồi", lập tức bác sĩ bị chặn quyền giải mã.
  * Tính năng **Zero-Knowledge Admin**: Khi chọn vai trò Admin bệnh viện, giao diện chứng minh Admin chỉ thấy dữ liệu mã hóa (Ciphertext), không có master-key.
  * Tính năng **Quorum Governance**: Thao tác sửa đổi lịch sử bệnh án bị chặn nếu chỉ có 1 bác sĩ đơn phương; yêu cầu tối thiểu 2 bên phê duyệt mới thành công.
  * Thanh **Live Cryptographic Audit Trail** cập nhật log thời gian thực.

---

### GIAI ĐOẠN 3: KIỂM THỬ BẢO MẬT & ĐẢM BẢO CHẤT LƯỢNG
* **Điều kiện Bắt đầu (Start Condition):**
  * Code UI và Logic ứng dụng đã chạy ổn định.
* **Tiêu chuẩn Hoàn thành (Stop / Exit Criteria):**
  * Lệnh `npm test` chạy pass 100% các bài test (kiểm tra phân quyền, thu hồi, và chống vượt quyền).
  * Kiểm tra Console trình duyệt (DevTools): 0 lỗi đỏ (Zero Console Errors).
  * Ghi nhận thành công 3 kịch bản tấn công thử nghiệm (Red-Team Pen-test Report).

---

### GIAI ĐOẠN 4: ĐÓNG GÓI, QUAY DEMO & NỘP BÀI
* **Điều kiện Bắt đầu (Start Condition):**
  * Ứng dụng đã hoàn thiện, test pass 100%.
* **Tiêu chuẩn Hoàn thành (Stop / Exit Criteria - TRƯỚC 18:00):**
  * File `README.md` ở thư mục gốc hoàn chỉnh, trả lời xuất sắc 5 tiêu chí chấm điểm, chèn huy hiệu `Built with TideCloak`.
  * File video demo `Video.mp4` thời lượng **dưới 2 phút** (1:50 - 1:58 là tối ưu), âm thanh/chữ rõ ràng, được lưu trực tiếp tại thư mục gốc của repository.
  * Toàn bộ mã nguồn, Docs, và video được push thành công lên `https://github.com/congnghetinhtu/hackathon`.
  * Hoàn thành form nộp bài tại `https://forms.gle/HRHYjnqB86j1LFS97` với tên nhóm đúng định dạng: `<university>_<campus>_<team>_C2`.
