# 🎬 KỊCH BẢN QUAY VIDEO DEMO 2 PHÚT (CAREVAULT DEMO SCRIPT)

> **Yêu cầu cuộc thi:** Video định dạng `.mp4`, thời lượng **tối đa 2 phút**, lưu trực tiếp tại thư mục gốc của repository GitHub.  
> **Thời lượng chuẩn bị:** 1 phút 55 giây (để dư 5 giây an toàn).

---

## ⏱️ PHÂN BỔ THỜI GIAN & HÀNH ĐỘNG CHI TIẾT

### 0:00 - 0:30 | PHÂN ĐOẠN 1: BỐI CẢNH & NỖI ĐAU THỰC TẾ
* **Hành động trên màn hình:**
  * Mở trang chủ CareVault (`http://localhost:5173/`).
  * Đang ở vai trò **"Bệnh nhân: Nguyễn Thị Lan"**.
  * Di chuột qua 2 hồ sơ bệnh án: (1) "Kết quả Điện tâm đồ Tim mạch" và (2) "Bệnh án Trị liệu Tâm lý Nhạy cảm".
* **Lời thoại / Phụ đề (Narration):**
  > *"Chào ban giám khảo, đây là CareVault – giải pháp sổ bệnh án tự chủ bảo mật xây dựng trên nền tảng TideCloak. Trong y tế hiện nay, bệnh nhân buộc phải giao toàn bộ dữ liệu nhạy cảm cho bệnh viện hoặc nền tảng trung gian. Bác sĩ chữa chấn thương đầu gối cũng có thể nhìn thấy hồ sơ tâm lý của bạn, và admin IT có thể đọc lén toàn bộ bệnh án. CareVault giải quyết triệt để nút thắt niềm tin này bằng mã hóa E2EE và phân quyền theo phiên."*

---

### 0:30 - 0:55 | PHÂN ĐOẠN 2: TIẾT LỘ CÓ CHỌN LỌC (SELECTIVE DISCLOSURE)
* **Hành động trên màn hình:**
  * Trên giao diện bệnh nhân, Lan cấp quyền hồ sơ Tim mạch cho **"BS. Trần Văn Minh (Tim mạch)"**, và hồ sơ Tâm lý cho **"BS. Lê Hoàng An (Tâm lý)"**.
  * Sử dụng bộ chuyển vai trò nhanh (**Switch Role**) góc trên: Chuyển sang **"BS. Trần Văn Minh"**.
  * Bác sĩ Minh mở thành công xem kết quả Điện tâm đồ (ECG đồ thị nhảy sống động).
  * Bác sĩ Minh thử bấm vào "Bệnh án Tâm lý" -> Hệ thống hiện thông báo đỏ từ chối: *"Access Denied by TideCloak: Unauthorized Specialty Scopes"*.
* **Lời thoại / Phụ đề (Narration):**
  > *"Ở đây, bệnh nhân Lan phân quyền có chọn lọc: Bác sĩ Minh Tim mạch chỉ giải mã được hồ sơ tim mạch. Khi bác sĩ Minh cố tình mở hồ sơ tâm lý, TideCloak lập tức chặn lại vì thiếu ủy quyền chuyên khoa. Không có chuyện xem chéo hồ sơ."*

---

### 0:55 - 1:25 | PHÂN ĐOẠN 3: BẺ GÃY QUYỀN LỰC ADMIN (ZERO-KNOWLEDGE ADMIN)
* **Hành động trên màn hình:**
  * Chuyển vai trò sang **"SysAdmin Bệnh viện (Quản trị viên)"**.
  * Mở tab "Database Raw View" (Xem dữ liệu thô trong cơ sở dữ liệu).
  * Màn hình hiển thị toàn bộ nội dung bệnh án dưới dạng các khối mã hóa rác (Ciphertext: `0x7F4A...`).
  * Thanh Live Cryptographic Audit Trail hiển thị log: `[ZERO_KNOWLEDGE_PRESERVED] Operator blind to payload`.
* **Lời thoại / Phụ đề (Narration):**
  > *"Quan trọng hơn cả: Hãy nhìn vào góc nhìn của Quản trị viên hệ thống. Dù là Admin nắm toàn quyền database, họ chỉ thấy dữ liệu mã hóa vô nghĩa. Nhờ kiến trúc Ineffable Cryptography của TideCloak, chìa khóa giải mã không bao giờ tồn tại ở máy chủ. Admin hoàn toàn không có 'God-mode' để đọc lén dữ liệu người bệnh."*

---

### 1:25 - 1:55 | PHÂN ĐOẠN 4: THU HỒI TỨC THÌ & CHỐNG SỬA BỆNH ÁN ĐƠN PHƯƠNG
* **Hành động trên màn hình:**
  * Chuyển lại vai trò **"Bệnh nhân Lan"** -> Nhấn nút **"Thu hồi quyền (Revoke)"** đối với Bác sĩ Minh.
  * Chuyển sang vai trò Bác sĩ Minh -> Bấm F5 tải lại trang -> Hồ sơ Tim mạch lập tức bị khóa, màn hình báo *"Entitlement Revoked"*.
  * Bác sĩ Minh cố tình bấm nút "Sửa lịch sử kê đơn" -> Hệ thống kích hoạt cảnh báo Quorum Governance: *"Blocked Unilateral Action: Cần tối thiểu 2/3 chữ ký từ Hội đồng Giám sát Y khoa"*.
* **Lời thoại / Phụ đề (Narration):**
  > *"Khi đợt khám kết thúc, bệnh nhân chỉ cần nhấn 'Thu hồi quyền'. Bác sĩ lập tức bị tước quyền giải mã. Đồng thời, không một ai có thể đơn phương chỉnh sửa lịch sử bệnh án để che giấu sai sót y khoa nếu không có sự phê duyệt túc số Quorum từ Hội đồng Y khoa độc lập. CareVault trả lại quyền làm chủ dữ liệu cho chính con người. Cảm ơn ban giám khảo!"*
