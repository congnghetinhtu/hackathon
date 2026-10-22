// Dev-only Vite middleware: a ciphertext-only blob store, an evidence log, and
// thin IGA helpers against the local TideCloak. Runs in the Vite dev server
// process, never in the browser bundle.
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.resolve("data");
const VAULT_FILE = path.join(DATA_DIR, "vault.json");
const EVIDENCE_FILE = path.join(DATA_DIR, "evidence.jsonl");
const PERSONAS_FILE = path.join(DATA_DIR, "personas.json");

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

let jwksCache = null;

async function signingKey(kid) {
  if (!jwksCache || !jwksCache.has(kid)) {
    const r = await fetch(`${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/certs`);
    const { keys } = await r.json();
    jwksCache = new Map(keys.filter((k) => k.use === "sig").map((k) => [k.kid, k]));
  }
  const jwk = jwksCache.get(kid);
  if (!jwk) throw new Error(`unknown signing key ${kid}`);
  return { jwk, key: crypto.createPublicKey({ key: jwk, format: "jwk" }) };
}

const b64url = (part) => Buffer.from(part, "base64url");

// Identity comes only from a TideCloak access token whose signature, issuer and
// expiry check out here; anything the client puts in the body is ignored.
async function verifiedCaller(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const [h, p, sig] = token.split(".");
  if (!h || !p || !sig) throw Object.assign(new Error("missing bearer token"), { status: 401 });
  const header = JSON.parse(b64url(h));
  const payload = JSON.parse(b64url(p));
  const { key } = await signingKey(header.kid);
  const data = Buffer.from(`${h}.${p}`);
  const ok =
    header.alg === "EdDSA"
      ? crypto.verify(null, data, key, b64url(sig))
      : header.alg === "RS256"
      ? crypto.verify("RSA-SHA256", data, key, b64url(sig))
      : false;
  if (!ok) throw Object.assign(new Error("bad token signature"), { status: 401 });
  if (payload.iss !== `${KC_URL}/realms/${KC_REALM}`) throw Object.assign(new Error("wrong issuer"), { status: 401 });
  if (payload.exp * 1000 < Date.now()) throw Object.assign(new Error("token expired"), { status: 401 });
  return {
    username: payload.preferred_username,
    roles: (payload.realm_access?.roles || []).filter((r) => r.startsWith("_tide_")),
    tokenIat: payload.iat,
  };
}

function readPersonas() {
  try {
    return JSON.parse(fs.readFileSync(PERSONAS_FILE, "utf8"));
  } catch {
    return {};
  }
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
    const caller = await verifiedCaller(req);
    const owner = caller.username;
    const { tag, label, ciphertext } = await readJson(req);
    if (!tag || typeof ciphertext !== "string") return [400, { error: "tag, ciphertext required" }];
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
    appendEvidence({ event: "BLOB_STORED", actor: owner, roles: caller.roles, verified: true, blobId: blob.id, tag, sha256: blob.sha256 });
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

  "GET /api/personas": async () => [200, readPersonas()],

  // The caller can only log events as itself. The decrypt outcome is still
  // reported by that signed-in client; see the note on the evidence page.
  "POST /api/evidence": async (req) => {
    const caller = await verifiedCaller(req);
    const { actor, roles, verified, ...rest } = await readJson(req);
    return [201, appendEvidence({ ...rest, actor: caller.username, roles: caller.roles, tokenIat: caller.tokenIat, verified: true })];
  },

  // IGA: assigning a realm role does not apply directly; TideCloak records a
  // pending change request that must be approved before it reaches tokens.
  "POST /api/iga/request-role": async (req) => {
    const caller = await verifiedCaller(req);
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
    appendEvidence({ event: "IGA_ROLE_REQUESTED", actor: caller.username, target: username, role, httpStatus: result.status, verified: true });
    return [200, { httpStatus: result.status, body: result.body }];
  },

  "GET /api/iga/pending": async () => {
    const r = await kc(`/iga/change-requests?status=PENDING`);
    return [r.status, r.body];
  },

  "POST /api/iga/approve": async (req) => {
    const caller = await verifiedCaller(req);
    const { id } = await readJson(req);
    const r = await kc(`/iga/change-requests/${encodeURIComponent(id)}/approve`, { method: "POST", body: "{}" });
    appendEvidence({ event: "IGA_CHANGE_APPROVED", actor: caller.username, approvedWith: `${KC_ADMIN} (dev master admin)`, changeRequestId: id, httpStatus: r.status, verified: true });
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
          send(res, err.status || 500, { error: err.message });
        }
      });
    },
  };
}
