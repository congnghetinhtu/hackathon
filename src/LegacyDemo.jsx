import React, { useReducer, useState } from "react";
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

export default function LegacyDemo() {
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

  const activeDoctor = state.clinicians.find((c) => c.id === role);
  const isDoctor = Boolean(activeDoctor);
  const isPatient = role === "patient";
  const isAdmin = role === "admin";
  const activeApprover = role.startsWith("panel-") ? state.ethicsPanel[Number(role.slice(6)) - 1] : null;

  const currentActorName = isPatient
    ? state.patient.name
    : isDoctor
    ? activeDoctor.name
    : isAdmin
    ? state.operator.name
    : activeApprover
    ? activeApprover.name
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

  return (
    <div className="shell">
      {/* TOPBAR */}

      {/* QUICK ROLE SWITCHER FOR SEAMLESS 2-MINUTE DEMO */}
      <div className="persona-strip">
        <span className="persona-label">
          Chuyển Vai Trò Demo (Switch Role):
        </span>
        <div className="persona-buttons">
          <button
            className={`persona-btn ${role === "patient" ? "active" : ""}`}
            onClick={() => { setRole("patient"); setActiveTab("records"); setNotice("Đã chuyển sang vai trò: Bệnh nhân Lan (Toàn quyền cấp & thu hồi)"); }}
          >
            Bệnh nhân Lan
          </button>
          <button
            className={`persona-btn ${role === "doc-cardio" ? "active" : ""}`}
            onClick={() => { setRole("doc-cardio"); setActiveTab("records"); setNotice("Đã chuyển sang: BS. Minh (Chuyên khoa Tim mạch)"); }}
          >
            BS. Minh (Tim mạch)
          </button>
          <button
            className={`persona-btn ${role === "doc-psych" ? "active" : ""}`}
            onClick={() => { setRole("doc-psych"); setActiveTab("records"); setNotice("Đã chuyển sang: BS. An (Chuyên khoa Tâm lý)"); }}
          >
            BS. An (Tâm lý)
          </button>
          <button
            className={`persona-btn ${role === "doc-ortho" ? "active" : ""}`}
            onClick={() => { setRole("doc-ortho"); setActiveTab("records"); setNotice("Đã chuyển sang: BS. Hùng (Chuyên khoa Xương khớp)"); }}
          >
            BS. Hùng (Xương khớp)
          </button>
          <button
            className={`persona-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => { setRole("admin"); setActiveTab("zk"); setNotice("Đã chuyển sang: Quản trị viên IT Bệnh viện (Xem database)"); }}
          >
            SysAdmin Bệnh viện
          </button>
          <button
            className={`persona-btn ${role === "panel-1" ? "active" : ""}`}
            onClick={() => { setRole("panel-1"); setActiveTab("quorum"); setNotice("Đã chuyển sang: GS. Amara Okafor (Chủ tịch Hội đồng Y đức)"); }}
          >
            Hội Đồng Y Đức
          </button>
          <button
            className={`persona-btn ${role === "panel-2" ? "active" : ""}`}
            onClick={() => { setRole("panel-2"); setActiveTab("quorum"); setNotice("Đã chuyển sang: BS. Sam Williams (Thanh tra Y khoa Độc lập)"); }}
          >
            Thanh tra Y khoa
          </button>
        </div>
      </div>

      {notice && (
        <div className="notice-banner">
          <span>{notice}</span>
          <button className="btn btn-quiet btn-sm" onClick={() => setNotice("")}>Đóng</button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="container">
        {/* HERO SECTION */}

        {/* NAVIGATION TABS */}
        <div className="nav-tabs">
          <button
            className={`tab-link ${activeTab === "records" ? "active" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            Hồ Sơ Bệnh Án & Quyền Giải Mã (mô phỏng)
          </button>
          <button
            className={`tab-link ${activeTab === "zk" ? "active" : ""}`}
            onClick={() => setActiveTab("zk")}
          >
            Góc Nhìn Admin (mô phỏng)
          </button>
          <button
            className={`tab-link ${activeTab === "quorum" ? "active" : ""}`}
            onClick={() => setActiveTab("quorum")}
          >
            Quản Trị Túc Số Y Khoa (mô phỏng)
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
                        <div>
                          <h2 className="card-title">{record.title}</h2>
                          <p className="card-subtitle">
                            Mã hồ sơ: <strong>{record.code}</strong> · Ngày khám: {record.date} · Chuyên khoa: {record.specialtyName}
                          </p>
                        </div>
                      </div>
                      <div>
                        {isRevoked ? (
                          <span className="badge badge-red">ĐÃ THU HỒI QUYỀN (REVOKED)</span>
                        ) : isDecrypted ? (
                          <span className="badge badge-green">ĐANG HIỂN THỊ (MÔ PHỎNG)</span>
                        ) : (
                          <span className="badge badge-yellow">MÃ HÓA E2EE (BỊ KHÓA)</span>
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
                                Đồ thị Điện tâm đồ (ECG Live Wave):
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
                                Thu hồi quyền (Revoke)
                              </button>
                            ) : (
                              <button className="btn btn-teal btn-sm" onClick={() => handleGrant(record, record.specialty)} aria-label={`Cấp lại quyền giải mã hồ sơ ${record.code} cho ${record.specialty}`}>
                                Cấp lại quyền giải mã
                              </button>
                            )}
                          </>
                        )}
                        {isDoctor && canDoctorDecrypt && (
                          <button className="btn btn-dark btn-sm" onClick={() => handleRequestAmendment(record)} aria-label={`Yêu cầu sửa đổi bệnh án ${record.code} (Quorum)`}>
                            Yêu cầu sửa đổi bệnh án (Quorum)
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
                    Cryptographic Audit Trail
                  </h3>
                  <span className="badge badge-yellow" style={{ fontSize: "0.7rem" }}>LOG TRONG APP (MÔ PHỎNG)</span>
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
                  Thử nghiệm: Admin cố tình vượt quyền giải mã (God-Mode Bypass)
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
                      Zero-Knowledge: Ngay cả khi hacker dump toàn bộ database PostgreSQL/MySQL, dữ liệu vẫn là chuỗi rác toán học vô dụng.
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
                  <span>{m.name}</span>
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
                        {req.status === "approved" ? "ĐÃ PHÊ DUYỆT (2/2 QUORUM)" : "CHỜ DUYỆT TÚC SỐ"}
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
                      {req.status === "pending" && activeApprover && (
                        <button
                          className="btn btn-teal btn-sm"
                          onClick={() => handleVote(req, activeApprover)}
                          disabled={req.approvals.some((a) => a.id === activeApprover.id)}
                          aria-label={`Bỏ phiếu phê duyệt yêu cầu sửa đổi ${req.recordTitle} (${req.approvals.length}/2)`}
                        >
                          {req.approvals.some((a) => a.id === activeApprover.id)
                            ? "Bạn đã ký duyệt"
                            : `${activeApprover.name} ký phê duyệt`}
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
    </div>
  );
}
