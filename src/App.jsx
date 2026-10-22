import React, { useEffect, useReducer, useState } from "react";
import { useTideCloak } from "@tidecloak/react";
import seed from "./seed.json";

function audit(state, actor, action, reason, severity = "info") {
  return {
    ...state,
    audit: [
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        time: new Date().toLocaleTimeString("vi-VN"),
        actor,
        action,
        reason,
        severity,
      },
      ...state.audit,
    ],
  };
}

function reducer(state, event) {
  if (event.type === "grant") {
    const records = state.records.map((rec) =>
      rec.id === event.recordId
        ? { ...rec, status: "granted", allowedSpecialties: Array.from(new Set([...rec.allowedSpecialties, event.specialty])) }
        : rec
    );
    return audit(
      { ...state, records },
      event.actor,
      "[E2EE_ENTITLEMENT_GRANTED]",
      `Cấp quyền truy cập giải mã hồ sơ ${event.recordCode} cho chuyên khoa ${event.specialty}. Token phiên được tạo bởi Fabric.`,
      "info"
    );
  }

  if (event.type === "revoke") {
    const records = state.records.map((rec) =>
      rec.id === event.recordId ? { ...rec, status: "revoked" } : rec
    );
    return audit(
      { ...state, records },
      event.actor,
      "[ENTITLEMENT_REVOKED_BY_PATIENT]",
      `Bệnh nhân chủ động THU HỒI quyền giải mã hồ sơ ${event.recordCode}. Mọi yêu cầu giải mã từ Fabric bị từ chối tức thì.`,
      "warning"
    );
  }

  if (event.type === "attempt_admin_override") {
    return audit(
      state,
      event.actor,
      "[UNILATERAL_OVERRIDE_PREVENTED]",
      "Quản trị viên IT (SysAdmin) thử dùng quyền Master-Key để đọc lén dữ liệu. Bị Tide chặn đứng: Mạng lưới Ineffable Fabric không phát hành khóa tổng cho máy chủ.",
      "danger"
    );
  }

  if (event.type === "request_amendment") {
    const newRequest = {
      id: `req-${Date.now()}`,
      recordId: event.recordId,
      recordTitle: event.recordTitle,
      doctor: event.doctor,
      proposedText: event.proposedText,
      reason: event.reason,
      approvals: [],
      status: "pending",
    };
    return audit(
      { ...state, quorumRequests: [newRequest, ...state.quorumRequests] },
      event.doctor,
      "[QUORUM_CHANGE_REQUESTED]",
      `Yêu cầu sửa đổi lịch sử bệnh án: "${event.proposedText}". Cần tối thiểu 2 chữ ký từ Hội đồng Y đức độc lập.`,
      "warning"
    );
  }

  if (event.type === "vote_amendment") {
    const req = state.quorumRequests.find((r) => r.id === event.requestId);
    if (!req || req.status !== "pending") return state;
    if (req.approvals.some((a) => a.id === event.approver.id)) return state;

    const approvals = [...req.approvals, event.approver];
    let nextState = audit(
      {
        ...state,
        quorumRequests: state.quorumRequests.map((r) =>
          r.id === req.id ? { ...r, approvals } : r
        ),
      },
      event.approver.name,
      "[QUORUM_APPROVAL_VOTE]",
      `Phê duyệt ${approvals.length}/2 cho sửa đổi bệnh án: ${req.reason}`,
      "info"
    );

    if (approvals.length >= 2) {
      nextState = {
        ...nextState,
        records: nextState.records.map((rec) =>
          rec.id === req.recordId
            ? {
                ...rec,
                data: {
                  ...rec.data,
                  notes: `${rec.data.notes} [ĐÃ ĐƯỢC HỘI ĐỒNG Y KHOA DUYỆT SỬA: ${req.proposedText}]`,
                },
              }
            : rec
        ),
        quorumRequests: nextState.quorumRequests.map((r) =>
          r.id === req.id ? { ...r, approvals, status: "approved" } : r
        ),
      };
      nextState = audit(
        nextState,
        "Hội đồng Y đức (Fabric Quorum)",
        "[AMENDMENT_APPLIED_BY_QUORUM]",
        `Sửa đổi bệnh án chính thức được ghi nhận sau khi có sự đồng thuận của ${approvals.map((a) => a.name).join(" và ")}.`,
        "info"
      );
    }
    return nextState;
  }

  return state;
}

export default function App() {
  const { authenticated, isInitializing, isLoading, login, logout, getValueFromToken } = useTideCloak();

  const [state, dispatch] = useReducer(reducer, {
    patient: seed.patient,
    clinicians: seed.clinicians,
    operator: seed.operator,
    ethicsPanel: seed.ethicsPanel,
    records: seed.records,
    quorumRequests: [],
    audit: [
      {
        id: "init-1",
        time: "11:50:00",
        actor: "CareVault Core",
        action: "[SYSTEM_INITIALIZED]",
        reason: "Khởi tạo hệ thống hồ sơ y tế phân tán với TideCloak Hermetic E2EE.",
        severity: "info",
      },
      {
        id: "init-2",
        time: "11:51:20",
        actor: "Nguyễn Thị Lan (Bệnh nhân)",
        action: "[E2EE_CLIENT_ENCRYPT]",
        reason: "3 hồ sơ bệnh án được phân mảnh và mã hóa đa bên bằng Ineffable Cryptography.",
        severity: "info",
      },
    ],
  });

  const [role, setRole] = useState("patient");
  const [activeTab, setActiveTab] = useState("records");
  const [notice, setNotice] = useState("");
  const [amendmentText, setAmendmentText] = useState("Cập nhật liều lượng Propranolol sang 5mg");

  useEffect(() => {
    if (location.pathname === "/auth/redirect" && !isInitializing) {
      history.replaceState(null, "", "/");
    }
  }, [isInitializing]);

  const activeDoctor = state.clinicians.find((c) => c.id === role);
  const isDoctor = Boolean(activeDoctor);
  const isPatient = role === "patient";
  const isAdmin = role === "admin";
  const isEthicsChair = role === "panel-1";

  const currentActorName = isPatient
    ? state.patient.name
    : isDoctor
    ? activeDoctor.name
    : isAdmin
    ? state.operator.name
    : isEthicsChair
    ? state.ethicsPanel[0].name
    : "Người dùng Khách";

  function handleRevoke(record) {
    dispatch({ type: "revoke", recordId: record.id, recordCode: record.code, actor: currentActorName });
    setNotice(`Đã thu hồi quyền truy cập hồ sơ ${record.code}. Bác sĩ không thể giải mã thêm.`);
  }

  function handleGrant(record, specialty) {
    dispatch({ type: "grant", recordId: record.id, recordCode: record.code, specialty, actor: currentActorName });
    setNotice(`Đã cấp quyền giải mã hồ sơ ${record.code} cho chuyên khoa ${specialty}.`);
  }

  function handleAdminAttempt() {
    dispatch({ type: "attempt_admin_override", actor: currentActorName });
    setNotice("Hành động bị chặn: Admin không có Master-Key giải mã trong kiến trúc Tide!");
  }

  function handleRequestAmendment(record) {
    if (!amendmentText.trim()) return;
    dispatch({
      type: "request_amendment",
      recordId: record.id,
      recordTitle: record.title,
      doctor: currentActorName,
      proposedText: amendmentText,
      reason: "Điều chỉnh y khoa định kỳ theo phản ứng lâm sàng của người bệnh",
    });
    setNotice("Đã gửi yêu cầu sửa đổi bệnh án tới Hội đồng Y đức.");
  }

  function handleVote(request, approver) {
    dispatch({ type: "vote_amendment", requestId: request.id, approver });
    setNotice(`Thành viên ${approver.name} đã bỏ phiếu phê duyệt.`);
  }

  async function handleLogin() {
    try {
      await login();
    } catch {
      setNotice("Mô phỏng phiên làm việc TideCloak Dev (Hoặc chạy Docker localhost:8080).");
    }
  }

  const tokenUser = authenticated ? getValueFromToken("name") || getValueFromToken("preferred_username") : "";

  return (
    <div className="shell">
      {/* TOPBAR */}
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">CV</span>
          <span>CareVault</span>
          <span className="brand-badge">Built with TideCloak</span>
        </a>
        <div className="top-actions">
          <span className={`auth-state ${authenticated ? "connected" : ""}`}>
            <i /> {authenticated ? `TideCloak · ${tokenUser || "Đã đăng nhập"}` : "TideCloak · Session Enclave Active"}
          </span>
          {authenticated ? (
            <button className="btn btn-quiet btn-sm" onClick={logout} aria-label="Đăng xuất TideCloak">Đăng xuất</button>
          ) : (
            <button className="btn btn-teal btn-sm" onClick={handleLogin} disabled={isLoading} aria-label="Đăng nhập TideCloak">
              {isLoading ? "Đang kết nối…" : "Đăng nhập TideCloak"}
            </button>
          )}
        </div>
      </header>

      {/* QUICK ROLE SWITCHER FOR SEAMLESS 2-MINUTE DEMO */}
      <div className="persona-strip">
        <span className="persona-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></svg>
          Chuyển Vai Trò Demo (Switch Role):
        </span>
        <div className="persona-buttons">
          <button
            className={`persona-btn ${role === "patient" ? "active" : ""}`}
            onClick={() => { setRole("patient"); setNotice("Đã chuyển sang vai trò: Bệnh nhân Lan (Toàn quyền cấp & thu hồi)"); }}
          >
            👤 Bệnh nhân Lan
          </button>
          <button
            className={`persona-btn ${role === "doc-cardio" ? "active" : ""}`}
            onClick={() => { setRole("doc-cardio"); setNotice("Đã chuyển sang: BS. Minh (Chuyên khoa Tim mạch)"); }}
          >
            🩺 BS. Minh (Tim mạch)
          </button>
          <button
            className={`persona-btn ${role === "doc-psych" ? "active" : ""}`}
            onClick={() => { setRole("doc-psych"); setNotice("Đã chuyển sang: BS. An (Chuyên khoa Tâm lý)"); }}
          >
            🧠 BS. An (Tâm lý)
          </button>
          <button
            className={`persona-btn ${role === "doc-ortho" ? "active" : ""}`}
            onClick={() => { setRole("doc-ortho"); setNotice("Đã chuyển sang: BS. Hùng (Chuyên khoa Xương khớp)"); }}
          >
            🦴 BS. Hùng (Xương khớp)
          </button>
          <button
            className={`persona-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => { setRole("admin"); setActiveTab("zk"); setNotice("Đã chuyển sang: Quản trị viên IT Bệnh viện (Xem database)"); }}
          >
            💻 SysAdmin Bệnh viện
          </button>
          <button
            className={`persona-btn ${role === "panel-1" ? "active" : ""}`}
            onClick={() => { setRole("panel-1"); setActiveTab("quorum"); setNotice("Đã chuyển sang: GS. Amara Okafor (Chủ tịch Hội đồng Y đức)"); }}
          >
            ⚖️ Hội Đồng Y Đức
          </button>
        </div>
      </div>

      {notice && (
        <div className="notice-banner">
          <span>🔔 {notice}</span>
          <button className="btn btn-quiet btn-sm" onClick={() => setNotice("")}>Đóng</button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="container">
        {/* HERO SECTION */}
        <section className="hero-banner">
          <div>
            <h1>Sổ Bệnh Án Tự Chủ Bảo Mật (Patient-Sovereign Health Vault)</h1>
            <p>
              Xóa bỏ nút thắt niềm tin trong y tế. Dữ liệu bệnh án được bảo vệ bằng mã hóa <strong>TideCloak Hermetic E2EE</strong>, 
              không phụ thuộc vào quyền lực tối thượng của quản trị viên (No God-mode Admin). Bệnh nhân nắm quyền sinh sát dữ liệu của chính mình.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="badge badge-green" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
              ✓ Đạt chuẩn HIPAA & GDPR Art. 9
            </span>
          </div>
        </section>

        {/* NAVIGATION TABS */}
        <div className="nav-tabs">
          <button
            className={`tab-link ${activeTab === "records" ? "active" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            📁 Hồ Sơ Bệnh Án & Quyền Giải Mã
          </button>
          <button
            className={`tab-link ${activeTab === "zk" ? "active" : ""}`}
            onClick={() => setActiveTab("zk")}
          >
            🔒 Góc Nhìn Admin (Zero-Knowledge Operator)
          </button>
          <button
            className={`tab-link ${activeTab === "quorum" ? "active" : ""}`}
            onClick={() => setActiveTab("quorum")}
          >
            ⚖️ Quản Trị Túc Số Y Khoa (Quorum Governance)
          </button>
        </div>

        {/* TAB 1: RECORDS VIEW */}
        {activeTab === "records" && (
          <div className="dashboard-grid">
            <div>
              {state.records.map((record) => {
                const canPatientDecrypt = isPatient;
                const canDoctorDecrypt =
                  isDoctor &&
                  record.allowedSpecialties.includes(activeDoctor.specialty) &&
                  record.status === "granted";
                const isDecrypted = canPatientDecrypt || canDoctorDecrypt;
                const isRevoked = record.status === "revoked";

                return (
                  <article key={record.id} className="card">
                    <div className="card-header">
                      <div className="card-header-main">
                        <div className="record-icon">
                          {record.specialty === "cardiology" ? "🫀" : record.specialty === "psychology" ? "🧠" : "🦴"}
                        </div>
                        <div>
                          <h2 className="card-title">{record.title}</h2>
                          <p className="card-subtitle">
                            Mã hồ sơ: <strong>{record.code}</strong> · Ngày khám: {record.date} · Chuyên khoa: {record.specialtyName}
                          </p>
                        </div>
                      </div>
                      <div>
                        {isRevoked ? (
                          <span className="badge badge-red">🚫 ĐÃ THU HỒI QUYỀN (REVOKED)</span>
                        ) : isDecrypted ? (
                          <span className="badge badge-green">🔓 ĐÃ GIẢI MÃ TIDECLOAK</span>
                        ) : (
                          <span className="badge badge-yellow">🔒 MÃ HÓA E2EE (BỊ KHÓA)</span>
                        )}
                      </div>
                    </div>

                    <div className="card-body">
                      {isDecrypted ? (
                        <div className="decrypted-view">
                          <div className="decrypted-row">
                            <span className="decrypted-label">Chẩn đoán Y khoa:</span>
                            <p className="decrypted-value" style={{ fontWeight: 600 }}>{record.data.diagnosis}</p>
                          </div>
                          <div className="decrypted-row">
                            <span className="decrypted-label">Chỉ số sinh tồn:</span>
                            <p className="decrypted-value">Nhịp tim: {record.data.heartRate} bpm · Huyết áp: {record.data.bp}</p>
                          </div>
                          <div className="decrypted-row">
                            <span className="decrypted-label">Đơn thuốc & Khuyến nghị điều trị:</span>
                            <p className="decrypted-value">{record.data.prescription}</p>
                          </div>
                          <div className="decrypted-row">
                            <span className="decrypted-label">Ghi chú lâm sàng:</span>
                            <p className="decrypted-value">{record.data.notes}</p>
                          </div>

                          {record.specialty === "cardiology" && (
                            <div className="ecg-box">
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f766e" }}>
                                📊 Đồ thị Điện tâm đồ (ECG Live Wave):
                              </span>
                              <svg className="ecg-svg" viewBox="0 0 200 40">
                                <path d="M0,20 L40,20 L50,5 L55,35 L60,10 L65,25 L70,20 L110,20 L120,5 L125,35 L130,10 L135,25 L140,20 L200,20" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="blocked-view">
                          <div className="blocked-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            {isRevoked
                              ? "TRUY CẬP BỊ TỪ CHỐI: Bệnh nhân đã thu hồi quyền của chuyên khoa này."
                              : `TRUY CẬP BỊ CHẶN: Bạn đang đăng nhập với chuyên khoa ${activeDoctor?.specialtyName || "khác"}. Không có quyền xem chéo hồ sơ!`}
                          </div>
                          <p style={{ fontSize: "0.85rem" }}>
                            TideCloak Fabric từ chối phát hành khóa giải mã phiên. Dữ liệu chỉ tồn tại dưới dạng mã hóa bảo vệ:
                          </p>
                          <div className="ciphertext-box" aria-label="Ciphertext (simulated — not real Tide E2EE)">
                            <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{"SIMULATED"}</span>{record.ciphertext}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        Trạng thái phân quyền: <strong>{record.allowedSpecialties.join(", ")}</strong>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {isPatient && (
                          <>
                            {record.status === "granted" ? (
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleRevoke(record)} aria-label={`Thu hồi quyền giải mã hồ sơ ${record.code}`}>
                                🚫 Thu hồi quyền (Revoke)
                              </button>
                            ) : (
                              <button className="btn btn-teal btn-sm" onClick={() => handleGrant(record, record.specialty)} aria-label={`Cấp lại quyền giải mã hồ sơ ${record.code} cho ${record.specialty}`}>
                                🔑 Cấp lại quyền giải mã
                              </button>
                            )}
                          </>
                        )}
                        {isDoctor && canDoctorDecrypt && (
                          <button className="btn btn-dark btn-sm" onClick={() => handleRequestAmendment(record)} aria-label={`Yêu cầu sửa đổi bệnh án ${record.code} (Quorum)`}>
                            ✏️ Yêu cầu sửa đổi bệnh án (Quorum)
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* AUDIT LOG PANEL */}
            <aside>
              <div className="audit-panel">
                <div className="audit-header">
                  <h3 className="audit-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Cryptographic Audit Trail
                  </h3>
                  <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>LIVE FABRIC</span>
                </div>
                <div className="audit-stream">
                  {state.audit.map((item) => (
                    <div key={item.id} className={`audit-item ${item.severity}`}>
                      <div className="audit-meta">
                        <span>{item.actor}</span>
                        <span>{item.time}</span>
                      </div>
                      <div className="audit-action">{item.action}</div>
                      <div className="audit-desc">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* TAB 2: ZERO-KNOWLEDGE OPERATOR VIEW */}
        {activeTab === "zk" && (
          <div>
            <div className="zk-banner">
              <h3>Bằng Chứng Bẻ Gãy Quyền Lực Admin (Zero-Knowledge Operator Proof)</h3>
              <p>
                Đây là góc nhìn trực tiếp từ <strong>Quản trị viên Cơ sở Dữ liệu & Máy chủ Bệnh viện (SysAdmin)</strong>.
                Trong kiến trúc truyền thống, Admin có thể đọc trọn vẹn mọi bệnh án. Nhưng với <strong>TideCloak Ineffable Cryptography</strong>,
                khóa giải mã không bao giờ tồn tại ở máy chủ. Admin hoàn toàn mù trước dữ liệu bệnh nhân.
              </p>
              <div style={{ marginTop: "1rem" }}>
                <button className="btn btn-danger" onClick={handleAdminAttempt} aria-label="Thử nghiệm Admin vượt quyền giải mã (God-Mode Bypass — bị chặn)">
                  ⚠️ Thử nghiệm: Admin cố tình vượt quyền giải mã (God-Mode Bypass)
                </button>
              </div>
            </div>

            <div className="zk-grid">
              {state.records.map((r) => (
                <div key={r.id} className="card" style={{ background: "#0f172a", color: "white", borderColor: "#334155" }}>
                  <div className="card-header" style={{ background: "#1e293b", borderColor: "#334155" }}>
                    <span style={{ fontWeight: 700, color: "#38bdf8" }}>DATABASE RECORD: {r.code}</span>
                    <span className="badge badge-slate" style={{ background: "#334155", color: "#94a3b8" }}>CIPHERTEXT ONLY</span>
                  </div>
                  <div className="card-body">
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                      Trường nhạy cảm (Encrypted Payload):
                    </p>
                    <div className="ciphertext-box" style={{ background: "#020617" }} aria-label="Ciphertext (simulated — not real Tide E2EE)">
                      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{"SIMULATED"}</span>{r.ciphertext}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.75rem" }}>
                      🔒 Zero-Knowledge: Ngay cả khi hacker dump toàn bộ database PostgreSQL/MySQL, dữ liệu vẫn là chuỗi rác toán học vô dụng.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUORUM MEDICAL GOVERNANCE */}
        {activeTab === "quorum" && (
          <div className="quorum-panel">
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Hội Đồng Y Đức & Quản Trị Túc Số Y Khoa (Medical Quorum Governance)
            </h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              Chống tình trạng bác sĩ hoặc giám đốc bệnh viện đơn phương chỉnh sửa bệnh án nhằm che giấu sai sót y khoa. 
              Mọi yêu cầu sửa đổi nhạy cảm bắt buộc phải đạt tối thiểu <strong>2 trong 3 chữ ký</strong> từ Hội đồng độc lập.
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Thành viên Hội đồng Y đức Độc lập (Panel Members):
              </h3>
              {state.ethicsPanel.map((m) => (
                <div key={m.id} className="approver-pill">
                  <span>🏛️ {m.name}</span>
                  <small style={{ color: "#64748b" }}>({m.title})</small>
                </div>
              ))}
            </div>

            <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>
                Danh sách Yêu cầu Sửa đổi Bệnh án Chờ Duyệt (Pending Quorum Requests):
              </h3>
              {state.quorumRequests.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  Chưa có yêu cầu sửa đổi nào. Bác sĩ có thể bấm nút "Yêu cầu sửa đổi bệnh án" ở tab Hồ sơ để tạo yêu cầu mới.
                </p>
              ) : (
                state.quorumRequests.map((req) => (
                  <div key={req.id} style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 700, color: "#0f766e" }}>{req.recordTitle}</span>
                      <span className={`badge ${req.status === "approved" ? "badge-green" : "badge-yellow"}`}>
                        {req.status === "approved" ? "✓ ĐÃ PHÊ DUYỆT (2/2 QUORUM)" : "⏳ CHỜ DUYỆT TÚC SỐ"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#334155", marginBottom: "0.5rem" }}>
                      Nội dung đề xuất: <strong>{req.proposedText}</strong>
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.75rem" }}>
                      Bác sĩ đề xuất: {req.doctor} · Lý do: {req.reason}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div style={{ fontSize: "0.85rem", color: "#0f766e", fontWeight: 600 }}>
                        Tiến độ phê duyệt: {req.approvals.length} / 2 chữ ký cần thiết
                      </div>
                      {req.status === "pending" && isEthicsChair && (
                        <button
                          className="btn btn-teal btn-sm"
                          onClick={() => handleVote(req, state.ethicsPanel[0])}
                          disabled={req.approvals.some((a) => a.id === state.ethicsPanel[0].id)}
                          aria-label={`Bỏ phiếu phê duyệt yêu cầu sửa đổi ${req.recordTitle} (${req.approvals.length}/2)`}
                        >
                          {req.approvals.some((a) => a.id === state.ethicsPanel[0].id)
                            ? "✓ Bạn đã ký duyệt"
                            : "✍️ GS. Amara Okafor ký phê duyệt"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="page-footer">
        CareVault · RMIT Hackathon 2026 (Challenge 2) · Powered by{" "}
        <a href="https://tide.org/tidecloak" target="_blank" rel="noreferrer">
          TideCloak & Emergent Authority
        </a>
      </footer>
    </div>
  );
}
