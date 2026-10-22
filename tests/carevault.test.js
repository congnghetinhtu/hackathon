import test from "node:test";
import assert from "node:assert/strict";

// Core logic helpers matching CareVault reducer
function canDecryptRecord(record, role, specialty) {
  if (role === "patient") return true;
  if (role === "hospital_admin") return false; // Zero-knowledge: Admin is blind
  if (record.status !== "granted") return false; // Revocation check
  return record.allowedSpecialties.includes(specialty);
}

function checkQuorumApproval(approvals, threshold = 2) {
  return approvals.length >= threshold;
}

// V3 — Hàm nghiệp vụ thiếu: revokeAccess
function revokeAccess(record, actor) {
  if (!record || !record.id) {
    return { success: false, reason: "Hồ sơ không hợp lệ" };
  }
  if (record.status === "revoked") {
    return { success: false, reason: "Quyền đã bị thu hồi trước đó" };
  }
  return {
    success: true,
    record: { ...record, status: "revoked" },
    actor,
    revokedAt: new Date().toISOString(),
  };
}

// V3 — Hàm nghiệp vụ thiếu: quorumVote
function quorumVote(request, approver) {
  if (!request || request.status !== "pending") {
    return { success: false, reason: "Yêu cầu không còn chờ duyệt" };
  }
  if (request.approvals.some((a) => a.id === approver.id)) {
    return { success: false, reason: "Người duyệt đã phiếu rồi" };
  }
  const approvals = [...request.approvals, approver];
  return {
    success: true,
    request: { ...request, approvals },
    approved: approvals.length >= 2,
  };
}

// V3 — Hàm nghiệp vụ thiếu: preventUnilateralOverride
function preventUnilateralOverride(actor, action) {
  if (actor.role === "hospital_admin" && action === "decrypt_record") {
    return {
      blocked: true,
      reason: "UNILATERAL_OVERRIDE_PREVENTED: Admin không có master-key",
    };
  }
  return { blocked: false };
}

test("CareVault Test 1: Bệnh nhân luôn có quyền giải mã hồ sơ của chính mình", () => {
  const record = { id: "rec-1", allowedSpecialties: ["cardiology"], status: "granted" };
  assert.equal(canDecryptRecord(record, "patient", null), true);
});

test("CareVault Test 2: Bác sĩ đúng chuyên khoa giải mã thành công", () => {
  const record = { id: "rec-1", allowedSpecialties: ["cardiology"], status: "granted" };
  assert.equal(canDecryptRecord(record, "doctor", "cardiology"), true);
});

test("CareVault Test 3: Bác sĩ khác chuyên khoa BỊ CHẶN giải mã (No Cross-Specialty Access)", () => {
  const cardioRecord = { id: "rec-1", allowedSpecialties: ["cardiology"], status: "granted" };
  // Bác sĩ Chấn thương chỉnh hình cố mở hồ sơ tim mạch
  assert.equal(canDecryptRecord(cardioRecord, "doctor", "orthopedics"), false);

  const psychRecord = { id: "rec-2", allowedSpecialties: ["psychology"], status: "granted" };
  // Bác sĩ Tim mạch cố mở bệnh án tâm lý nhạy cảm
  assert.equal(canDecryptRecord(psychRecord, "doctor", "cardiology"), false);
});

test("CareVault Test 4: Thu hồi quyền tức thì (Instant Revocation)", () => {
  const record = { id: "rec-1", allowedSpecialties: ["cardiology"], status: "revoked" };
  // Ngay cả bác sĩ đúng chuyên khoa cũng bị từ chối sau khi bệnh nhân bấm Revoke
  assert.equal(canDecryptRecord(record, "doctor", "cardiology"), false);
});

test("CareVault Test 5: SysAdmin Bệnh viện bị tước bỏ God-mode (Zero-Knowledge Operator)", () => {
  const record = { id: "rec-1", allowedSpecialties: ["cardiology"], status: "granted" };
  // Quản trị viên cơ sở dữ liệu không thể giải mã
  assert.equal(canDecryptRecord(record, "hospital_admin", null), false);
});

test("CareVault Test 6: Quản trị túc số chống sửa bệnh án đơn phương (Quorum 2/3)", () => {
  const approver1 = { id: "app-1", name: "Prof. Okafor" };
  const approver2 = { id: "app-2", name: "Dr. Williams" };

  // 1 chữ ký -> Chưa được duyệt
  assert.equal(checkQuorumApproval([approver1], 2), false);

  // Đủ 2 chữ ký -> Được phê duyệt chính thức
  assert.equal(checkQuorumApproval([approver1, approver2], 2), true);
});

// V3 — Test 7: revokeAccess từ chối nếu hồ sơ đã bị thu hồi
test("CareVault Test 7: revokeAccess từ chối nếu hồ sơ đã bị thu hồi", () => {
  const record = { id: "rec-1", status: "revoked" };
  const result = revokeAccess(record, { id: "actor-1", name: "Bệnh nhân Lan" });
  assert.equal(result.success, false);
  assert.equal(result.reason, "Quyền đã bị thu hồi trước đó");
});

// V3 — Test 8: revokeAccess thành công và chuyển trạng thái thành revoked
test("CareVault Test 8: revokeAccess thành công và chuyển trạng thái thành revoked", () => {
  const record = { id: "rec-1", status: "granted" };
  const result = revokeAccess(record, { id: "actor-1", name: "Bệnh nhân Lan" });
  assert.equal(result.success, true);
  assert.equal(result.record.status, "revoked");
  assert.equal(result.actor.name, "Bệnh nhân Lan");
});

// V3 — Test 9: quorumVote từ chối nếu yêu cầu không còn pending
test("CareVault Test 9: quorumVote từ chối nếu yêu cầu không còn pending", () => {
  const request = { id: "req-1", status: "approved", approvals: [] };
  const approver = { id: "app-1", name: "Prof. Okafor" };
  const result = quorumVote(request, approver);
  assert.equal(result.success, false);
  assert.equal(result.reason, "Yêu cầu không còn chờ duyệt");
});

// V3 — Test 10: quorumVote từ chối nếu người duyệt đã phiếu
test("CareVault Test 10: quorumVote từ chối nếu người duyệt đã phiếu", () => {
  const request = {
    id: "req-1",
    status: "pending",
    approvals: [{ id: "app-1", name: "Prof. Okafor" }],
  };
  const approver = { id: "app-1", name: "Prof. Okafor" };
  const result = quorumVote(request, approver);
  assert.equal(result.success, false);
  assert.equal(result.reason, "Người duyệt đã phiếu rồi");
});

// V3 — Test 11: quorumVote thành công và đạt quorum khi đủ 2 phiếu
test("CareVault Test 11: quorumVote thành công và đạt quorum khi đủ 2 phiếu", () => {
  const request = {
    id: "req-1",
    status: "pending",
    approvals: [{ id: "app-1", name: "Prof. Okafor" }],
  };
  const approver = { id: "app-2", name: "Dr. Williams" };
  const result = quorumVote(request, approver);
  assert.equal(result.success, true);
  assert.equal(result.approved, true);
  assert.equal(result.request.approvals.length, 2);
});

// V3 — Test 12: preventUnilateralOverride chặn Admin giải mã hồ sơ
test("CareVault Test 12: preventUnilateralOverride chặn Admin giải mã hồ sơ", () => {
  const actor = { id: "admin-1", role: "hospital_admin", name: "SysAdmin" };
  const result = preventUnilateralOverride(actor, "decrypt_record");
  assert.equal(result.blocked, true);
  assert.equal(
    result.reason,
    "UNILATERAL_OVERRIDE_PREVENTED: Admin không có master-key"
  );
});

// V3 — Test 13: preventUnilateralOverride không chặn người dùng thường
test("CareVault Test 13: preventUnilateralOverride không chặn người dùng thường", () => {
  const actor = { id: "doctor-1", role: "doctor", name: "BS. Minh" };
  const result = preventUnilateralOverride(actor, "decrypt_record");
  assert.equal(result.blocked, false);
});
