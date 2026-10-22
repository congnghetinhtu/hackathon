# 🏥 CAREVAULT: HỒ SƠ Y TẾ TỰ CHỦ BẢO MẬT (PATIENT-SOVEREIGN HEALTH VAULT)
## TÀI LIỆU BÁO CÁO DỰ ÁN: LÝ DO HÌNH THÀNH, CÔNG NĂNG & GIÁ TRỊ XÃ HỘI

---

## 1. TẠI SAO CẦN CAREVAULT? (LÝ DO SỬ DỤNG & NỖI ĐAU THỰC TẾ)

### 1.1. Cái bẫy "Được ăn cả, ngã về không" của Hồ sơ Bệnh án Điện tử
Trong ngành y tế toàn cầu và tại Việt Nam hiện nay, việc chuyển đổi số hồ sơ bệnh án đang đối mặt với một nghịch lý lớn:
* **Tính nhạy cảm cực hạn của dữ liệu sức khỏe:** Các bệnh án về sức khỏe tâm thần, điều trị trầm cảm, chẩn đoán HIV/bệnh lây truyền, lịch sử phá thai, hiếm muộn, hay xét nghiệm gen ung thư là những bí mật riêng tư nhất của một con người. Nếu thông tin này bị rò rỉ, bệnh nhân có thể bị phân biệt đối xử tại nơi làm việc, bị kỳ thị xã hội, bị các công ty bảo hiểm từ chối bồi thường hoặc tăng phí vô lý, thậm chí trở thành nạn nhân của tống tiền và lừa đảo.
* **Cơ chế chia sẻ truyền thống quá thô sơ:** Khi bệnh nhân đi khám một chuyên khoa cụ thể (ví dụ: khám viêm da liễu hoặc phục hồi chức năng sau chấn thương thể thao), hệ thống thường bắt buộc phải mở toàn bộ sổ y bạ cho bác sĩ hoặc phòng khám đó. Một bác sĩ da liễu không cần và **tuyệt đối không nên nhìn thấy lịch sử điều trị tâm thần** của người bệnh.

### 1.2. Nút thắt niềm tin (The Trust Bottleneck) & Vấn nạn "Admin God-Mode"
* Mọi ứng dụng y tế và cổng bệnh án điện tử hiện nay đều phụ thuộc vào mô hình lưu trữ máy chủ tập trung (Centralized Cloud/Database).
* **Quản trị viên có quyền lực tối thượng (God-mode):** Nhân viên IT bệnh viện, kỹ sư cơ sở dữ liệu (DBA), hoặc các tin tặc chiếm được tài khoản quản trị hệ thống đều có thể đọc trọn vẹn văn bản thô (Plaintext) hồ sơ bệnh án của tất cả bệnh nhân.
* **Không thể thu hồi một khi đã trao đi:** Khi người bệnh nộp hồ sơ hoặc chuyển viện, bản sao bệnh án nằm lại vĩnh viễn trên máy chủ của bên tiếp nhận mà người bệnh không có quyền năng kỹ thuật nào để thu hồi hay xóa bỏ.

---

## 2. CÔNG NĂNG CỐT LÕI CỦA CAREVAULT (CORE CAPABILITIES)

Được xây dựng trên nền tảng **TideCloak** và kiến trúc **Emergent Authority (Thẩm quyền phân tán)**, CareVault mang lại 4 công năng mang tính cách mạng:

### 1. Mã hóa đầu cuối theo phiên (Session-bound E2EE - Ineffable Cryptography)
* Dữ liệu hồ sơ bệnh án được mã hóa trực tiếp trên trình duyệt của bệnh nhân trước khi truyền đi.
* Chìa khóa giải mã không bao giờ tồn tại nguyên vẹn ở bất kỳ máy chủ hay cơ sở dữ liệu nào. Dù máy chủ bệnh viện bị xâm nhập 100%, hacker hay nhân viên IT cũng chỉ thu được các khối dữ liệu rác đã mã hóa (Zero-Knowledge Architecture).

### 2. Tiết lộ có chọn lọc theo chuyên khoa (Granular Scoped Disclosure)
* Bệnh nhân hoàn toàn làm chủ việc phân bổ dữ liệu:
  * **Hồ sơ Tim mạch & Điện tâm đồ (ECG):** Chỉ cấp quyền cho Bác sĩ Tim mạch.
  * **Hồ sơ Trị liệu Tâm lý:** Chỉ cấp quyền cho Bác sĩ Tâm thần / Chuyên gia Tâm lý.
  * **Phim X-Quang chấn thương:** Chỉ cấp quyền cho Bác sĩ Chấn thương Chỉnh hình.
* Các bác sĩ tuyệt đối không thể xem chéo dữ liệu ngoài chuyên khoa được ủy quyền.

### 3. Thu hồi quyền tức thì (Instant Cryptographic Revocation)
* Khi đợt khám bệnh kết thúc, người bệnh chỉ cần nhấn nút **"Thu hồi quyền" (Revoke Access)** trên ứng dụng.
* Mạng lưới Fabric của Tide lập tức thu hồi token giải mã của bác sĩ đó. Ngay cả khi bác sĩ còn lưu đường link hay cache, mọi yêu cầu giải mã trong tương lai đều bị từ chối triệt để.

### 4. Quản trị túc số chống sửa bệnh án đơn phương (Quorum Medical Governance)
* Để bảo vệ tính toàn vẹn của hồ sơ pháp y và lịch sử khám chữa bệnh, **không một bác sĩ hay giám đốc bệnh viện nào có thể đơn phương chỉnh sửa hoặc xóa lịch sử kê đơn/phẫu thuật** (để che giấu sai sót y khoa).
* Mọi thay đổi nhạy cảm bắt buộc phải đạt được sự đồng thuận của tối thiểu **2/3 thành viên Hội đồng Y khoa độc lập** (ví dụ: Bác sĩ điều trị + Trưởng ban Giám sát Y khoa).

---

## 3. GIÁ TRỊ VÀ LỢI ÍCH CHO XÃ HỘI & CÁC BÊN LIÊN QUAN

### 3.1. Đối với Bệnh nhân (Patients)
* **Lấy lại quyền kiểm soát cuộc đời:** Bệnh nhân không còn là "nạn nhân bị động" của các vụ rò rỉ dữ liệu y tế. Họ biết chính xác ai đang xem hồ sơ của mình và có thể ngắt quyền bất kỳ lúc nào.
* **Xóa bỏ rào cản tâm lý khi đi khám:** Người bệnh không còn lo sợ bị kỳ thị khi đi khám các bệnh nhạy cảm (tâm lý, bệnh xã hội), thúc đẩy người dân chủ động chăm sóc sức khỏe sớm hơn.

### 3.2. Đối với Bác sĩ & Nhân viên Y tế (Clinicians)
* **Chỉ tập trung vào chuyên môn:** Bác sĩ nhận được đúng và đủ thông tin cần thiết để chẩn đoán, không bị quá tải bởi các thông tin không liên quan.
* **Bảo vệ y đức & trách nhiệm pháp lý:** Có chứng thực phân quyền rõ ràng, tránh bị vu khống làm rò rỉ dữ liệu của bệnh nhân.

### 3.3. Đối với Bệnh viện & Cơ sở Y tế (Healthcare Providers)
* **Miễn nhiễm trước các vụ tấn công tống tiền (Ransomware/Data Breach Immunity):** Vì toàn bộ cơ sở dữ liệu là dạng mã hóa đầu cuối và không có master-key, các cuộc tấn công đánh cắp dữ liệu y tế trở nên vô nghĩa đối với hacker.
* **Tiết kiệm hàng triệu USD chi phí tuân thủ bảo mật:** Giảm thiểu rủi ro bị phạt theo các quy định bảo vệ dữ liệu.

### 3.4. Đối với Xã hội & Khung Pháp lý (Societal & Regulatory Impact)
* **Tương thích hoàn hảo với Luật pháp Quốc tế & Việt Nam:**
  * **Luật Khám bệnh, chữa bệnh Việt Nam 2023 (Điều 69):** Hiện thực hóa bằng công nghệ quyền của người bệnh được giữ bí mật thông tin về tình trạng sức khỏe và đời tư.
  * **HIPAA (Mỹ) & GDPR Article 9 (Châu Âu):** Đạt tiêu chuẩn cao nhất về bảo vệ danh mục dữ liệu sức khỏe đặc biệt nhạy cảm.
* **Thúc đẩy hợp tác nghiên cứu y học an toàn:** Cho phép chia sẻ dữ liệu y tế phục vụ nghiên cứu khoa học mà không sợ lộ danh tính bệnh nhân.
