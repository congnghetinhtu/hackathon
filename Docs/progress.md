# 📊 BẢNG THEO DÕI TIẾN ĐỘ DỰ ÁN CAREVAULT (PROGRESS TRACKING)

> **Dự án:** CareVault – Patient-Sovereign Health Vault (RMIT Hackathon 2026 - Challenge 2)  
> **Repository:** https://github.com/congnghetinhtu/hackathon  
> **Hạn chót nộp bài:** 18:00 (VN) ngày 22/10/2026  
> **Cập nhật lần cuối:** 22/10/2026 11:52:00 (GMT+7)

---

## 🚦 TỔNG QUAN TIẾN ĐỘ CHUNG (OVERALL STATUS)

| Hạng mục | Trạng thái | Tiến độ | Ghi chú |
| :--- | :---: | :---: | :--- |
| **1. Khung tài liệu quản trị (Docs/)** | 🟢 Hoàn thành | 100% | Đầy đủ progress, skillDefine, startAndStop, reason, demoScript |
| **2. Tải & Cài đặt đủ bộ Skills** | 🟢 Hoàn thành | 100% | Đã bổ sung `tide-red-team`, `grc-review`, `tide-rbac-and-e2ee`, `generative-ui` |
| **3. Mã nguồn ứng dụng (Source Code)** | ⚪ Sẵn sàng | 0% | Sẵn sàng khởi tạo React + Vite + TideCloak |
| **4. Bộ dữ liệu y tế giả lập (Synthetic Data)** | ⚪ Sẵn sàng | 0% | Chuẩn bị `seed.json` chuẩn HL7/FHIR simplified |
| **5. Kiểm thử tự động (Unit Test TDD)** | ⚪ Chưa bắt đầu | 0% | Viết test case Vitest cho các hàm E2EE & Quorum |
| **6. File README.md chấm điểm** | ⚪ Chưa bắt đầu | 0% | Chuẩn 5 tiêu chí chấm điểm của RMIT & Tide |
| **7. Kịch bản & Video Demo 2 phút (.mp4)** | 🟡 Sẵn sàng kịch bản | 50% | Đã có kịch bản chi tiết trong `demoScript.md` |
| **8. Nộp bài qua Google Form** | ⚪ Chưa bắt đầu | 0% | Deadline 18:00 |

---

## 🛠️ TIẾN ĐỘ CHI TIẾT THEO TỪNG SKILL

### 1. Nhóm Kiến trúc & Nghiệp vụ Y tế
- [x] **`using-agent-skills`**: Thiết lập khung làm việc và điều phối các skill.
- [x] **`spec-driven-development`**: Hoàn thành tài liệu phân tích nghiệp vụ, mô hình dữ liệu CareVault.
- [x] **`planning-and-task-breakdown`**: Phân rã công việc chi tiết theo thời gian thực.
- [ ] **`understand-domain`**: Chuẩn hóa dữ liệu bệnh án theo các khoa (Tim mạch, Tâm lý, X-Quang, Xét nghiệm).

### 2. Nhóm Lập trình Giao diện & Trực quan hóa
- [ ] **`frontend-ui-engineering`**: Dựng khung ứng dụng React 19 + Tailwind, giao diện Medical Clean Theme.
- [ ] **`generative_ui`**: Tạo biểu đồ điện tâm đồ (ECG Chart) động và thẻ hồ sơ bảo mật.
- [ ] **`observability-and-instrumentation`**: Xây dựng thanh Live Cryptographic Audit Log trên giao diện.

### 3. Nhóm Bảo mật & Tiêu chuẩn Pháp lý
- [ ] **`security-and-hardening`**: Kiểm tra rò rỉ token, đảm bảo zero plaintext trong storage.
- [ ] **`tide-red-team`**: Thực hiện và ghi nhận 3 bài test thâm nhập (Admin DB breach, Expired revocation, Unilateral override).
- [ ] **`grc-review`**: Tích hợp các luận điểm tuân thủ HIPAA, GDPR Article 9, Luật Khám bệnh chữa bệnh 2023 vào tài liệu.

### 4. Nhóm Đảm bảo Chất lượng Mã nguồn
- [ ] **`test-driven-development` (TDD)**: Viết và chạy thành công 100% test cases cho logic phân quyền & Quorum.
- [ ] **`code-simplification` & `code-review-and-quality`**: Tối ưu hóa mã nguồn, xóa bỏ code rác trước khi push.
- [ ] **`browser-testing-with-devtools`**: Test trên trình duyệt thực tế, kiểm tra console sạch 100%.

### 5. Nhóm Tư liệu Hóa & Đóng gói Nộp bài
- [ ] **`documentation-and-adrs`**: Soạn thảo file `README.md` bám sát 100% barem 5 câu hỏi của cuộc thi.
- [ ] **`doubt-driven-development`**: Phản biện và chuẩn bị bộ giải trình kiến trúc cho ban giám khảo.
- [ ] **`shipping-and-launch`**: Rà soát checklist: Git commit, video 2 phút `.mp4`, submit link form đúng hạn.
