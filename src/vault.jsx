import React, { createContext, useContext, useEffect, useState } from "react";
import { useTideCloak } from "@tidecloak/react";
import { useLang } from "./i18n.jsx";

// Shared state for every page: the signed-in Tide identity, the ciphertext-only
// blob store and the evidence log. Decrypted plaintext lives only in React
// state (never in storage).

export const TAG_LABELS = { cardio: ["Tim mạch", "Cardiology"], psych: ["Tâm lý", "Psychology"] };

export function tagLabel(tag, t) {
  const pair = TAG_LABELS[tag];
  return pair ? t(pair[0], pair[1]) : tag;
}

export const SAMPLE_RECORDS = {
  cardio: {
    title: "Điện tâm đồ (ECG)",
    body: JSON.stringify({ heartRate: "72 bpm", rhythm: "Nhịp xoang", note: "Theo dõi Propranolol 10mg (dữ liệu giả lập)" }),
  },
  psych: {
    title: "Ghi chú trị liệu tâm lý",
    body: JSON.stringify({ note: "Rối loạn lo âu, tái khám sau 2 tuần (dữ liệu giả lập)" }),
  },
};

export function shortId(id) {
  return id && id.length > 20 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id || "";
}

export function short(text, n = 96) {
  return text && text.length > n ? `${text.slice(0, n)}…` : text || "";
}

// Tide-linked usernames are opaque hashes. Demo personas are registered per
// account in data/personas.json; they are display labels only and never
// inferred from roles (roles change during the IGA scenario).
export function personaLabel(personas, username, lang = "vi") {
  const p = personas[username];
  if (!p) return lang === "en" ? "No demo persona registered" : "Chưa đăng ký vai trò demo";
  return (lang === "en" && p.label_en) || p.label;
}

export function formatTime(iso, lang = "vi") {
  return iso ? new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "vi-VN") : "";
}

async function api(path, body, token) {
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const r = await fetch(path, body ? { method: "POST", headers, body: JSON.stringify(body) } : { headers });
  return r.json();
}

function toTransport(value) {
  if (typeof value === "string") return value;
  return btoa(String.fromCharCode(...value));
}

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const tide = useTideCloak();
  const { lang } = useLang();
  const { authenticated, doEncrypt, doDecrypt, getValueFromToken, forceRefreshToken, getConfig, getToken } = tide;
  const [blobs, setBlobs] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [results, setResults] = useState({});
  const [busy, setBusy] = useState("");
  const [pending, setPending] = useState(null);
  const [personas, setPersonas] = useState({});
  const [, setTokenVersion] = useState(0);

  const username = authenticated ? getValueFromToken("preferred_username") || "" : "";
  const tideRoles = authenticated ? (getValueFromToken("realm_access")?.roles || []).filter((r) => r.startsWith("_tide_")) : [];
  const issuedAt = authenticated ? getValueFromToken("iat") : null;
  const config = (() => {
    try {
      return getConfig() || {};
    } catch {
      return {};
    }
  })();

  async function reload() {
    try {
      setBlobs(await api("/api/blobs"));
      setEvidence(await api("/api/evidence"));
      setPersonas(await api("/api/personas"));
    } catch {
      // Vault API only exists in the dev server; pages show empty states.
    }
  }

  useEffect(() => {
    reload();
  }, []);

  // Writes carry the access token; the server takes actor and roles from it.
  async function authed(path, body) {
    return api(path, body, await getToken());
  }

  async function log(entry) {
    await authed("/api/evidence", entry);
  }

  async function encrypt(tag, label, plaintext) {
    setBusy("encrypt");
    let blob = null;
    try {
      const [encrypted] = await doEncrypt([{ data: plaintext, tags: [tag] }]);
      blob = await authed("/api/blobs", { tag, label, ciphertext: toTransport(encrypted) });
    } catch (err) {
      await log({ event: "ENCRYPT_FAILED", tag, error: String(err?.message || err) });
    }
    setBusy("");
    await reload();
    return blob;
  }

  async function decrypt(blob) {
    setBusy(blob.id);
    try {
      const [decrypted] = await doDecrypt([{ encrypted: blob.ciphertext, tags: [blob.tag] }]);
      const text = typeof decrypted === "string" ? decrypted : new TextDecoder().decode(decrypted);
      setResults((prev) => ({ ...prev, [blob.id]: { ok: true, text, by: username, at: new Date().toISOString() } }));
      await log({ event: "DECRYPT_OK", blobId: blob.id, owner: blob.owner, tag: blob.tag, sha256: blob.sha256 });
    } catch (err) {
      const message = String(err?.message || err);
      setResults((prev) => ({ ...prev, [blob.id]: { ok: false, text: message, by: username, at: new Date().toISOString() } }));
      await log({ event: "DECRYPT_DENIED", blobId: blob.id, owner: blob.owner, tag: blob.tag, sha256: blob.sha256, error: message });
    }
    setBusy("");
    reload();
  }

  async function refreshToken() {
    const before = tideRoles;
    await forceRefreshToken();
    setTokenVersion((v) => v + 1);
    const after = (getValueFromToken("realm_access")?.roles || []).filter((r) => r.startsWith("_tide_"));
    await log({ event: "TOKEN_REFRESHED", rolesBefore: before, rolesAfter: after, iat: getValueFromToken("iat") });
    reload();
  }

  async function loadPending() {
    try {
      setPending(await api("/api/iga/pending"));
    } catch (err) {
      setPending({ error: String(err?.message || err) });
    }
  }

  async function requestRole(user, role) {
    await authed("/api/iga/request-role", { username: user || username, role });
    await loadPending();
    reload();
  }

  async function approve(id) {
    await authed("/api/iga/approve", { id });
    await loadPending();
    reload();
  }

  const value = {
    ...tide,
    username,
    tideRoles,
    issuedAt,
    personas,
    persona: personaLabel(personas, username, lang),
    config,
    blobs,
    evidence,
    results,
    busy,
    pending,
    reload,
    encrypt,
    decrypt,
    refreshToken,
    loadPending,
    requestRole,
    approve,
  };
  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  return useContext(VaultContext);
}

// Demo gates, computed only from server-verified evidence entries (actor and
// roles taken from a checked token). Legacy unverified entries are ignored.
export function computeGates(allEvidence, blobs, personas = {}, t = (vi) => vi) {
  const evidence = allEvidence.filter((e) => e.verified);
  const keyOf = (u) => personas[u]?.key;
  const g1 = evidence.find((e) => e.event === "DECRYPT_OK" && e.actor === e.owner && keyOf(e.actor) === "patient");
  const g2 = evidence.find(
    (e) => e.event === "DECRYPT_DENIED" && keyOf(e.actor) === "agent" && (e.roles || []).some((r) => r.endsWith(".selfdecrypt"))
  );
  const isAdmin = (e) => keyOf(e.actor) === "sysadmin";
  const requested = evidence.find((e) => e.event === "IGA_ROLE_REQUESTED" && isAdmin(e));
  const approved = evidence.find((e) => e.event === "IGA_CHANGE_APPROVED");
  const refreshedWithRole = evidence.find(
    (e) => e.event === "TOKEN_REFRESHED" && isAdmin(e) && (e.rolesAfter || []).length > (e.rolesBefore || []).length
  );
  const deniedAfter =
    refreshedWithRole &&
    evidence.find(
      (e) => e.event === "DECRYPT_DENIED" && e.actor === refreshedWithRole.actor && e.at > refreshedWithRole.at && (e.roles || []).length > 0
    );
  return [
    {
      id: t("G1 (gốc)", "G1 (original)"),
      title: t("Lan chia sẻ hồ sơ cho bác sĩ, bác sĩ giải mã được", "Lan shares a record with a clinician who can decrypt it"),
      detail: t(
        "Mục tiêu ban đầu. Chưa đạt: role selfdecrypt chỉ mở dữ liệu của chính mình; chia sẻ chéo cần policy Forseti mà hướng dẫn tạo chưa được Tide phát hành.",
        "Original goal. Not achieved: selfdecrypt only opens the caller's own data; cross-user sharing needs a Forseti policy whose creation guide Tide has not published."
      ),
      status: "blocked",
    },
    {
      id: t("G1 (thu hẹp)", "G1 (narrowed)"),
      title: t("Lan tự mã hóa và tự giải mã", "Lan encrypts and decrypts her own record"),
      detail: t("Lan mã hóa trên trình duyệt, kho chỉ lưu ciphertext, Lan giải mã lại được. Không chứng minh chia sẻ.", "Lan encrypts in her browser, the vault stores only ciphertext, Lan decrypts it again. Does not prove sharing."),
      status: g1 ? "pass" : "todo",
      proof: g1,
    },
    {
      id: "G2",
      title: t("AI agent có role vẫn bị từ chối", "AI agent with the role is still refused"),
      detail: t("Tài khoản agent có _tide_cardio.selfdecrypt tải cùng blob nhưng Tide từ chối giải mã.", "The agent account holds _tide_cardio.selfdecrypt, downloads the same blob, and Tide refuses to decrypt it."),
      status: g2 ? "pass" : "todo",
      proof: g2,
    },
    {
      id: "G3",
      title: t("Đổi quyền phải qua IGA, admin vẫn không đọc được", "Role changes go through IGA; the admin still cannot read"),
      detail: t("SysAdmin xin role → chờ duyệt → duyệt → token mới có role → giải mã vẫn bị từ chối.", "SysAdmin requests a role → pending → approved → new token has the role → decryption still refused."),
      status: requested && approved && refreshedWithRole && deniedAfter ? "pass" : requested || approved ? "partial" : "todo",
      proof: deniedAfter || refreshedWithRole || approved || requested,
    },
  ];
}
