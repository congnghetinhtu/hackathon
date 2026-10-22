# 📜 ĐỊNH NGHĨA VAI TRÒ & GIỚI HẠN CỦA CÁC SKILL (SKILL DEFINITION & GUARDRAILS)

> **Mục tiêu:** Xác định rõ từng Skill được phép làm gì (Scope) và **tuyệt đối không được làm gì (Out of Scope / Guardrails)** để tránh lan man, vượt ngoài tầm kiểm soát và đảm bảo dự án CareVault hoàn thành chuẩn xác trước hạn chót.

> 📌 **BẮT BUỘC:** Mọi AI agent làm việc trong repo này **phải đọc `currentWrite.md` (ở thư mục gốc) trước khi hành động** và **phải cập nhật file đó sau mỗi lần sửa code** (nhật ký can thiệp append-only, có ghi khoảng cách giữa các lần can thiệp). Chi tiết protocol tại `currentWrite.md` §1.

---

### 1. `using-agent-skills` (Meta-Orchestrator)
* **ĐƯỢC LÀM:**
  * Điều phối thứ tự kích hoạt các skill theo đúng quy trình phát triển.
  * Đảm bảo tính liên kết và chuyển giao dữ liệu mạch lạc giữa các skill.
* **KHÔNG ĐƯỢC LÀM:**
  * Tự ý gọi các skill không liên quan đến bài thi hackathon hoặc tự tạo các quy trình rườm rà gây chậm tiến độ trước 18:00.

---

### 2. `spec-driven-development` & `planning-and-task-breakdown`
* **ĐƯỢC LÀM:**
  * Xác định rõ cấu trúc dữ liệu y tế giả lập (`Synthetic Health Records`), danh sách Role (`PATIENT`, `DOCTOR_CARDIO`, `DOCTOR_PSYCH`, `HOSPITAL_ADMIN`), và các trạng thái quyền hạn.
  * Lên kế hoạch triển khai theo từng chặng thời gian rõ ràng.
* **KHÔNG ĐƯỢC LÀM:**
  * Không đưa ra các yêu cầu kiến trúc quá phức tạp vượt quá phạm vi của một bản mẫu Hackathon (như viết backend database phân tán thực sự, triển khai Forseti contract C# lên Mainnet).
  * Không làm gián đoạn tiến độ lập trình bằng những tài liệu dài dòng không có tính thực thi.

---

### 3. `frontend-ui-engineering` & `generative_ui`
* **ĐƯỢC LÀM:**
  * Xây dựng giao diện React 19 + Tailwind CSS theo phong cách Sổ Bệnh Án Số (Medical Dashboard) sạch sẽ, hiện đại.
  * Tích hợp bộ chuyển đổi vai trò (Switch Persona) bằng 1 click để quay video demo mượt mà.
  * Vẽ biểu đồ nhịp tim (ECG) động và hiệu ứng lật thẻ hồ sơ bảo mật (Locked / Decrypted).
* **KHÔNG ĐƯỢC LÀM:**
  * Không sáng chế ra các layout phức tạp, nhiều tầng lớp khiến ứng dụng bị chậm hoặc lỗi tương thích trên trình duyệt.
  * Không sử dụng các thư viện UI bên thứ ba cồng kềnh, nặng nề làm vỡ bundle build của Vite.

---

### 4. `observability-and-instrumentation`
* **ĐƯỢC LÀM:**
  * Xây dựng thanh nhật ký mật mã trực tiếp (**Live Cryptographic Audit Trail**) trên giao diện.
  * Bắn log hiển thị các sự kiện: `[E2EE_ENCRYPT_CLIENT]`, `[SESSION_DECRYPT_SUCCESS]`, `[REVOKE_ACCESS_TRIGGERED]`, `[UNILATERAL_OVERRIDE_PREVENTED]`.
* **KHÔNG ĐƯỢC LÀM:**
  * Không cài đặt các hệ thống giám sát phân tán nặng nề như Prometheus, Datadog hay OpenTelemetry backend.
  * Không để việc ghi log làm nghẽn hiệu năng giao diện người dùng.

---

### 5. `security-and-hardening` & `tide-red-team`
* **ĐƯỢC LÀM:**
  * Kiểm toán bảo mật dữ liệu: Đảm bảo dữ liệu bệnh án nhạy cảm không bị rò rỉ dạng văn bản thô (Plaintext) vào `localStorage` hay `sessionStorage`.
  * Thực hiện 3 kịch bản tấn công mô phỏng (Red-team Pen-test): (1) Admin xem lén DB, (2) Bác sĩ xem sau khi bị Revoke, (3) Admin đơn phương sửa bệnh án.
  * Lập báo cáo kết quả phòng thủ để đưa vào `README.md`.
* **KHÔNG ĐƯỢC LÀM:**
  * Tuyệt đối **KHÔNG sử dụng dữ liệu bệnh nhân thật (Real PII/PHI)**. Toàn bộ dữ liệu bệnh án bắt buộc phải là dữ liệu tổng hợp giả lập (Synthetic Data).
  * Không cố gắng triển khai tải lên Smart Contract tùy biến lên mạng Tide (vì việc này thuộc quyền quản trị của Tide Core Team).

---

### 6. `grc-review` (Governance, Risk & Compliance)
* **ĐƯỢC LÀM:**
  * Đối chuẩn và trích dẫn các điều khoản pháp lý y tế (HIPAA, GDPR Article 9, Luật Khám bệnh chữa bệnh Việt Nam 2023) để đưa vào file `reason.md` và `README.md`.
  * Khẳng định giá trị thực tiễn và tính sẵn sàng của CareVault đối với các cơ sở y tế.
* **KHÔNG ĐƯỢC LÀM:**
  * Không tự nhận CareVault đã có chứng chỉ pháp lý chính thức (phải nêu rõ là kiến trúc tuân thủ về mặt kỹ thuật - Architectural Compliance).

---

### 7. `test-driven-development` (TDD)
* **ĐƯỢC LÀM:**
  * Viết một bộ test case tinh gọn (Vitest) kiểm tra chính xác các hàm nghiệp vụ: `canDecryptRecord()`, `revokeAccess()`, `quorumVote()`, `preventUnilateralOverride()`.
  * Đảm bảo lệnh `npm test` chạy pass 100% khi ban giám khảo clone repo về kiểm tra.
* **KHÔNG ĐƯỢC LÀM:**
  * Không viết test tràn lan các component UI tĩnh gây lãng phí thời gian trước deadline.

---

### 8. `documentation-and-adrs` & `shipping-and-launch`
* **ĐƯỢC LÀM:**
  * Soạn thảo file `README.md` chính ở thư mục gốc trả lời chính xác 5 câu hỏi trọng tâm của ban giám khảo RMIT Hackathon 2026.
  * Đính kèm huy hiệu `Built with TideCloak`, hướng dẫn chạy local 2 bước với Docker và npm.
  * Chuẩn bị kịch bản quay video demo 2 phút (.mp4) và rà soát link nộp Google Form.
* **KHÔNG ĐƯỢC LÀM:**
  * Không viết README sơ sài hoặc bỏ sót bất kỳ tiêu chí nào trong 5 tiêu chí chấm điểm.
  * Không để sót các file rác, file `.env` chứa mật khẩu bí mật, hoặc file video quá 2 phút trên repository.
