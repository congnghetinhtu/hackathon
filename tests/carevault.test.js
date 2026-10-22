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

test("CareVault Test 6: Quản trị túc số chống sửa bệnh án đơn phương (Quorum 2/2)", () => {
  const approver1 = { id: "app-1", name: "Prof. Okafor" };
  const approver2 = { id: "app-2", name: "Dr. Williams" };

  // 1 chữ ký -> Chưa được duyệt
  assert.equal(checkQuorumApproval([approver1], 2), false);

  // Đủ 2 chữ ký -> Được phê duyệt chính thức
  assert.equal(checkQuorumApproval([approver1, approver2], 2), true);
});
