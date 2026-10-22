// Dev-only Vite middleware: a ciphertext-only blob store, an evidence log, and
// thin IGA helpers against the local TideCloak. Runs in the Vite dev server
// process, never in the browser bundle.
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.resolve("data");
const VAULT_FILE = path.join(DATA_DIR, "vault.json");
const EVIDENCE_FILE = path.join(DATA_DIR, "evidence.jsonl");

const KC_URL = process.env.KC_URL ?? "http://localhost:8080";
const KC_REALM = process.env.KC_REALM ?? "carevault";
const KC_ADMIN = process.env.KC_ADMIN ?? "admin";
const KC_PASSWORD = process.env.KC_PASSWORD ?? "password";

function readVault() {
  try {
    return JSON.parse(fs.readFileSync(VAULT_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeVault(blobs) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(VAULT_FILE, JSON.stringify(blobs, null, 2));
}

function appendEvidence(entry) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const line = { at: new Date().toISOString(), ...entry };
  fs.appendFileSync(EVIDENCE_FILE, JSON.stringify(line) + "\n");
  return line;
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function masterToken() {
  const r = await fetch(`${KC_URL}/realms/master/protocol/openid-connect/token`, {
    method: "POST",
    body: new URLSearchParams({ username: KC_ADMIN, password: KC_PASSWORD, grant_type: "password", client_id: "admin-cli" }),
  });
  if (!r.ok) throw new Error(`master token HTTP ${r.status}`);
  return (await r.json()).access_token;
}

async function kc(pathname, init = {}) {
  const token = await masterToken();
  const r = await fetch(`${KC_URL}/admin/realms/${KC_REALM}${pathname}`, {
    ...init,
    headers: { "Content-Type": "application/json", authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  const text = await r.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {}
  return { status: r.status, body };
}

const routes = {
  "GET /api/blobs": async () => [200, readVault()],

  // The server only ever receives ciphertext; it hashes it so viewers can
  // confirm everyone is looking at the same bytes.
  "POST /api/blobs": async (req) => {
    const { owner, tag, label, ciphertext } = await readJson(req);
    if (!owner || !tag || typeof ciphertext !== "string") return [400, { error: "owner, tag, ciphertext required" }];
    const blob = {
      id: `blob-${Date.now().toString(36)}`,
      owner,
      tag,
      label: label || tag,
      ciphertext,
      sha256: crypto.createHash("sha256").update(ciphertext).digest("hex"),
      createdAt: new Date().toISOString(),
    };
    writeVault([blob, ...readVault()]);
    appendEvidence({ event: "BLOB_STORED", actor: owner, blobId: blob.id, tag, sha256: blob.sha256 });
    return [201, blob];
  },

  "GET /api/evidence": async () => {
    try {
      const lines = fs.readFileSync(EVIDENCE_FILE, "utf8").trim().split("\n").filter(Boolean);
      return [200, lines.map((l) => JSON.parse(l)).reverse()];
    } catch {
      return [200, []];
    }
  },

  "POST /api/evidence": async (req) => [201, appendEvidence(await readJson(req))],

  // IGA: assigning a realm role does not apply directly; TideCloak records a
  // pending change request that must be approved before it reaches tokens.
  "POST /api/iga/request-role": async (req) => {
    const { username, role } = await readJson(req);
    const users = await kc(`/users?username=${encodeURIComponent(username)}&exact=true`);
    const user = users.body?.[0];
    if (!user) return [404, { error: `user ${username} not found` }];
    const roleRep = await kc(`/roles/${encodeURIComponent(role)}`);
    if (roleRep.status !== 200) return [404, { error: `role ${role} not found` }];
    const result = await kc(`/users/${user.id}/role-mappings/realm`, {
      method: "POST",
      body: JSON.stringify([roleRep.body]),
    });
    appendEvidence({ event: "IGA_ROLE_REQUESTED", actor: username, role, httpStatus: result.status });
    return [200, { httpStatus: result.status, body: result.body }];
  },

  "GET /api/iga/pending": async () => {
    const r = await kc(`/iga/change-requests?status=PENDING`);
    return [r.status, r.body];
  },

  "POST /api/iga/approve": async (req) => {
    const { id } = await readJson(req);
    const r = await kc(`/iga/change-requests/${encodeURIComponent(id)}/approve`, { method: "POST", body: "{}" });
    appendEvidence({ event: "IGA_CHANGE_APPROVED", actor: `${KC_ADMIN} (dev master admin)`, changeRequestId: id, httpStatus: r.status });
    return [200, { httpStatus: r.status, body: r.body }];
  },
};

export default function vaultServer() {
  return {
    name: "carevault-vault-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url.split("?")[0];
        const handler = routes[`${req.method} ${url}`];
        if (!handler) return next();
        try {
          const [status, payload] = await handler(req);
          send(res, status, payload);
        } catch (err) {
          send(res, 500, { error: err.message });
        }
      });
    },
  };
}
