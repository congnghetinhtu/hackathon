# 🏛️ KIẾN TRÚC HỆ THỐNG CAREVAULT (CAREVAULT SYSTEM ARCHITECTURE)
## TÀI LIỆU THIẾT KẾ KIẾN TRÚC & MẬT MÃ PHÂN TÁN (DISTRIBUTED CRYPTOGRAPHIC ARCHITECTURE WHITEPAPER)

> **Dự án:** CareVault – Patient-Sovereign Health Vault  
> **Nền tảng bảo mật:** [TideCloak](https://tide.org/tidecloak) (Tide Foundation)  
> **Tiêu chuẩn áp dụng:** Emergent Authority, Ineffable Cryptography, Hermetic E2EE, Quorum Governance

---

## 1. TỔNG QUAN KIẾN TRÚC (HIGH-LEVEL ARCHITECTURE)

Khác với các hệ thống y tế điện tử (EHR/EMR) truyền thống vốn đặt niềm tin vào máy chủ trung tâm và người quản trị cơ sở dữ liệu (*Centralized Custody*), CareVault áp dụng mô hình **Thẩm quyền Phân tán (Emergent Authority)**. Dữ liệu bệnh án không có chủ sở hữu tối thượng là bệnh viện hay công ty phần mềm, mà quyền lực thuộc về chính người bệnh.

```mermaid
graph TD
    subgraph ClientLayer ["1. Tầng Trình Duyệt Bệnh Nhân & Bác Sĩ (Client Enclave)"]
        Patient["Bệnh nhân: Nguyễn Thị Lan<br/>(Chủ sở hữu khóa & quyền)"]
        DocCardio["BS. Minh (Tim mạch)<br/>(Scoped: cardiology)"]
        DocPsych["BS. An (Tâm lý)<br/>(Scoped: psychology)"]
        DocOrtho["BS. Hùng (Xương khớp)<br/>(Scoped: orthopedics)"]
    end

    subgraph TideFabric ["2. Mạng Lưới Mật Mã Phân Tán (TideCloak Fabric)"]
        TideAuth["TideCloak IAM & Session Gateway<br/>(DPoP & Ephemeral Tokens)"]
        ORK["Mạng lưới ORK (Never-Whole-Key)<br/>Distributed Key Generation (DKG)"]
        QuorumEngine["Cơ chế Túc số Y đức (Quorum Engine)<br/>2/3 Multi-Party Threshold"]
    end

    subgraph StorageLayer ["3. Tầng Lưu Trữ Vô Tri (Zero-Knowledge Storage)"]
        HospitalDB[("Database Bệnh Viện<br/>(Chỉ chứa Ciphertext 0x8F9B...)")]
        Admin["SysAdmin Bệnh viện / Hacker<br/>(Không có Master-Key -> MÙ 100%)"]
    end

    Patient -->|"1. Mã hóa E2EE tại Client"| TideAuth
    TideAuth -->|"2. Phân mảnh khóa qua DKG"| ORK
    ORK -->|"3. Gửi Ciphertext lưu trữ"| HospitalDB

    DocCardio -->|"4. Yêu cầu giải mã Tim mạch"| TideAuth
    TideAuth -->|"5. Xác thực Scope hợp lệ"| ORK
    ORK -->|"6. Cấp token giải mã phiên"| DocCardio

    DocCardio -.->|"7. Thử mở bệnh án Tâm lý"| TideAuth
    TideAuth -.->|"❌ TỪ CHỐI (Thiếu Scope)"| DocCardio

    Patient -->|"8. Bấm REVOKE"| TideAuth
    TideAuth -->|"9. Hủy quyền tức thì"| ORK

    Admin -.->|"Cố dùng Root Key xem dữ liệu"| HospitalDB
    HospitalDB -.->|"❌ CHỈ THẤY RÁC MÃ HÓA"| Admin
```

---

## 2. BỐN TẦNG KIẾN TRÚC CỐT LÕI (THE 4 ARCHITECTURAL TIERS)

### Tầng 1: Client Enclave & User Experience Layer
* **Công nghệ:** React 19, `@tidecloak/react`, Vite, Tailwind CSS.
* **Đặc tính kỹ thuật:**
  * Dữ liệu y tế giả lập (`seed.json`) được xử lý và phân tách ngay tại máy khách.
  * Không bao giờ lưu trữ dữ liệu văn bản thô (Plaintext) vào `localStorage` hay `sessionStorage`.
  * Bộ chuyển đổi vai trò (*Role Switcher*) tương tác trực tiếp với Context của TideCloak để mô phỏng các vai trò thực tế.

### Tầng 2: TideCloak Decentralized Fabric Layer
* **Công nghệ:** TideCloak Authentication Server, Orchestrated Recluders of Keys (ORK), DPoP (Demonstration of Proof-of-Possession).
* **Đặc tính kỹ thuật:**
  * **Never-Whole-Key Model:** Không một máy chủ đơn lẻ nào nắm giữ trọn vẹn khóa giải mã. Khóa được phân mảnh theo cơ chế *Nested Shamir Secret Sharing* trên mạng lưới các node ORK.
  * **Session-bound Decryption:** Khóa giải mã chỉ được phát hành tạm thời cho phiên làm việc của bác sĩ đáp ứng đủ 2 điều kiện: (1) Được bệnh nhân gắn thẻ ủy quyền chuyên khoa, và (2) Trạng thái hồ sơ chưa bị thu hồi (`status === "granted"`).

### Tầng 3: Medical Quorum Governance Layer
* **Công nghệ:** Multi-Party Threshold Signature Policy.
* **Đặc tính kỹ thuật:**
  * Áp dụng cho các thao tác y tế nhạy cảm: sửa đổi đơn thuốc, cập nhật chẩn đoán pháp y hoặc điều chỉnh hồ sơ sau phẫu thuật.
  * Một bác sĩ hay giám đốc bệnh viện đơn phương bấm sửa sẽ bị hệ thống kích hoạt ngoại lệ `[UNILATERAL_OVERRIDE_PREVENTED]`.
  * Yêu cầu tối thiểu **2/3 chữ ký độc lập** (ví dụ: Bác sĩ điều trị + Chủ tịch Hội đồng Y đức) mới có thể hợp thức hóa dữ liệu.

### Tầng 4: Zero-Knowledge Persistence Layer
* **Công nghệ:** PostgreSQL / MySQL / Object Storage.
* **Đặc tính kỹ thuật:**
  * Cơ sở dữ liệu của bệnh viện đóng vai trò là một **"Kho chứa vô tri" (Blind Custodian)**.
  * Dữ liệu được lưu trữ dưới dạng Ciphertext nhị phân. Dù máy chủ bị chiếm quyền Root hoặc cơ sở dữ liệu bị rò rỉ 100%, dữ liệu thu được vẫn chỉ là các chuỗi toán học không thể dịch ngược.

---

## 3. SƠ ĐỒ TUẦN TỰ MẬT MÃ (CRYPTOGRAPHIC SEQUENCE FLOWS)

### 3.1. Luồng Tiết lộ có chọn lọc (Selective Scoped Disclosure)
```mermaid
sequenceDiagram
    autonumber
    actor Patient as Bệnh nhân (Lan)
    participant Client as CareVault UI
    participant Tide as TideCloak Gateway
    participant Fabric as Mạng ORK Fabric
    actor Doctor as BS. Minh (Tim mạch)

    Patient->>Client: Chọn hồ sơ Tim mạch & cấp quyền BS. Minh
    Client->>Tide: Gửi yêu cầu cấp Scoped Entitlement (specialty: cardiology)
    Tide->>Fabric: Đăng ký phân quyền phiên cho DID của BS. Minh
    Fabric-->>Tide: Xác nhận đăng ký thành công
    Tide-->>Client: Trả về trạng thái GRANTED

    Doctor->>Client: Đăng nhập & Mở hồ sơ Tim mạch
    Client->>Tide: Gửi Token phiên kèm Scope "cardiology"
    Tide->>Fabric: Kiểm tra chính sách & Shard giải mã
    Fabric-->>Client: Giải mã thành công tại Client Memory
    Client-->>Doctor: Hiển thị chẩn đoán & Đồ thị ECG

    Doctor->>Client: Cố mở hồ sơ Tâm lý (Psychology)
    Client->>Tide: Yêu cầu mở hồ sơ "psychology"
    Tide-->>Client: ❌ 403 Forbidden: Missing Specialty Scope
    Client-->>Doctor: Cảnh báo đỏ: Truy cập bị từ chối!
```

### 3.2. Luồng Thu hồi quyền tức thì (Instant Revocation)
```mermaid
sequenceDiagram
    autonumber
    actor Patient as Bệnh nhân (Lan)
    participant Client as CareVault UI
    participant Fabric as Tide Fabric Network
    actor Doctor as Bác sĩ

    Patient->>Client: Bấm "Thu hồi quyền (Revoke)"
    Client->>Fabric: Gửi lệnh thu hồi Entitlement của hồ sơ
    Fabric->>Fabric: Hủy Shard giải mã phiên của Bác sĩ
    Fabric-->>Client: Xác nhận REVOKED
    
    Doctor->>Client: Nhấn F5 tải lại hồ sơ cũ
    Client->>Fabric: Yêu cầu giải mã lại
    Fabric-->>Client: ❌ Denied: Entitlement Terminated
    Client-->>Doctor: Khóa hồ sơ & Hiển thị Ciphertext
```

---

## 4. MA TRẬN MÔ HÌNH THỰC THỂ & PHÂN QUYỀN (RBAC & ENTITY MODEL)

| Thực thể (Entity) | Vai trò (Role) | Thẩm quyền dữ liệu (Data Authority) | Cơ chế kiểm soát |
| :--- | :--- | :--- | :--- |
| **Bệnh nhân (Lan)** | `ROLE_PATIENT` | Toàn quyền sở hữu: Đọc, Mã hóa, Cấp quyền, Thu hồi quyền | Tự chủ hoàn toàn (Patient Sovereignty) |
| **BS. Minh** | `ROLE_DOCTOR_CARDIO` | Đọc hồ sơ Tim mạch khi còn hiệu lực | Scoped Entitlement (`cardiology`) |
| **BS. An** | `ROLE_DOCTOR_PSYCH` | Đọc bệnh án Tâm lý khi còn hiệu lực | Scoped Entitlement (`psychology`) |
| **BS. Hùng** | `ROLE_DOCTOR_ORTHO` | Đọc hồ sơ X-Quang khi còn hiệu lực | Scoped Entitlement (`orthopedics`) |
| **Hội đồng Y đức** | `ROLE_ETHICS_PANEL` | Phê duyệt sửa đổi bệnh án nhạy cảm | Quorum Threshold (≥ 2/3 chữ ký) |
| **SysAdmin Bệnh viện** | `ROLE_HOSPITAL_ADMIN` | Vận hành máy chủ, xem trạng thái hệ thống | **Zero-Knowledge** (Không có quyền giải mã) |

---

## 5. MÔ HÌNH ĐE DỌA & BIỆN PHÁP BẢO VỆ (THREAT MODEL & MITIGATIONS)

| Nguy cơ tấn công (Threat) | Kẻ tấn công (Attacker) | Hệ thống truyền thống | CareVault với TideCloak |
| :--- | :--- | :--- | :--- |
| **Rò rỉ toàn bộ Database (DB Dump)** | Hacker / Kỹ sư DBA nội bộ | Toàn bộ bệnh án bị lộ dưới dạng Plaintext | **Miễn nhiễm.** Chỉ lấy được Ciphertext; không có master key để giải mã. |
| **Xem chéo hồ sơ (Cross-Snooping)** | Bác sĩ chuyên khoa khác | Xem lén được bệnh án tâm thần, phá thai | **Bị chặn.** Fabric từ chối cấp khóa giải mã cho chuyên khoa không hợp lệ. |
| **Sử dụng quyền sau điều trị** | Bác sĩ đã bị chấm dứt đợt khám | Vẫn xem được dữ liệu cũ nếu lưu link | **Bị chặn.** Khi bệnh nhân bấm Revoke, lượt giải mã tiếp theo bị từ chối triệt để. |
| **Sửa đổi hồ sơ che giấu lỗi y khoa** | Bác sĩ / Giám đốc BV | Âm thầm cập nhật database che đậy | **Bị chặn.** Cơ chế Quorum yêu cầu 2/3 chữ ký từ Hội đồng Y đức độc lập. |

---

## 6. ĐỐI CHUẨN PHÁP LÝ Y TẾ (REGULATORY COMPLIANCE MAPPING)

Kiến trúc CareVault được thiết kế tương thích với các quy định y tế khắt khe nhất:
1. **HIPAA (Hoa Kỳ - 45 CFR § 164.312):** Đạt tiêu chuẩn về *Transmission Security* và nguyên tắc *Minimum Necessary Access* (Chỉ cấp quyền tối thiểu cần thiết để chữa bệnh).
2. **GDPR (Châu Âu - Article 9):** Bảo vệ danh mục dữ liệu sức khỏe đặc biệt nhạy cảm và hiện thực hóa *Quyền được rút lại sự đồng thuận (Right to Withdraw Consent)* chỉ bằng 1 nút bấm.
3. **Luật Khám bệnh, chữa bệnh Việt Nam 2023 (Điều 69):** Hiện thực hóa bằng công nghệ quyền của người bệnh được bảo mật thông tin khám chữa bệnh và đời tư.
