[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

## Project overview

CareVault is a patient-held health vault: records are encrypted in the patient's browser with TideCloak, so the people and AI agents who store, move and administer them handle only ciphertext they cannot open.

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

> RMIT Hackathon 2026 · Challenge 2. All medical data in this repo is synthetic.

### 1. Vision & originality

Health portals today treat the hospital or SaaS operator as the custodian of a patient's file: whoever runs the database can read it. CareVault separates **custody** from **access**. The vault server, the hospital IT team and any AI agent wired into the workflow can hold, copy, index and back up a record, but they cannot read it. Only an identity the TideCloak network authorises can decrypt it.

What is distinctive is the AI-agent case. More and more automation, such as triage bots, summarisers and integration agents, gets broad service accounts. CareVault tests this directly: an agent account gets the same decrypt role as the patient and then tries to open the patient's record. Tide's documentation says it should be refused, because holding a role is not the same as being able to read someone else's data. The result is recorded in the verification table below.

### 2. Trust constraint insight

**What is hard today:** a patient with a sensitive condition (mental health, reproductive health, addiction) has to trust every administrator, backup operator and service account that touches the system. One over-privileged admin, one leaked agent token or one database dump exposes readable records. That fear makes people delay care or withhold information from clinicians.

**The specific trust problem:** in a conventional stack, the party that grants permissions also holds the keys. An admin can quietly give themselves access, and an agent with an API token reads everything that token can reach.

**What becomes possible when it is removed:**
- Storage, hosting and automation can be outsourced without handing over read access. The server in this prototype stores only ciphertext and its SHA-256 hash.
- Decryption is enforced by the TideCloak network (threshold 14 of 20 ORK nodes for this realm), not by a key file on our server.
- Permission changes are not silent. With IGA enabled, assigning a role creates a pending change request that must be approved before it reaches any token.

### 3. Value & impact

**Who benefits:**
- **Patients**, who can keep sensitive records digital without trusting every operator.
- **Hospitals and vendors**, who can run storage and automation while holding data they cannot read, which shrinks the impact of a breach or an insider.
- **Teams adopting AI agents**, who can let agents move and organise records without giving them the content.

**Concrete example:** Nguyễn Thị Lan (synthetic persona) stores her ECG result and her therapy notes in CareVault. The hospital's integration agent syncs her vault every night, and SysAdmin Taylor Reed manages the server. Both can see that blobs exist and verify their hashes. The prototype checks that neither can read the therapy notes, even after the agent is given a decrypt role and the admin gets a role approved through IGA (see *Verification status*).

**Scope of claims:** the design follows the *minimum necessary access* idea behind health-privacy rules such as HIPAA and GDPR Art. 9. This is architectural alignment only, not a compliance certification.

### 4. Why TideCloak matters

| TideCloak capability | How CareVault uses it | Code |
|---|---|---|
| Tide login (front-channel) | Each persona (`lan`, `agent`, `sysadmin`) is a separate Tide-linked account in realm `carevault`. | [`src/main.jsx`](src/main.jsx), [`src/App.jsx`](src/App.jsx) |
| Tag-scoped E2EE: `doEncrypt` / `doDecrypt` | Lan encrypts a record under tag `cardio` or `psych` in her browser. Decryption is requested from the Tide network, which checks the caller's `_tide_<tag>.selfdecrypt` role. Tide's docs state that this role opens only the caller's own data; the agent and admin steps test that claim. | [`src/vault.jsx`](src/vault.jsx), [`src/pages.jsx`](src/pages.jsx) |
| Ciphertext-only storage | The vault API stores ciphertext plus a SHA-256 hash, never plaintext or keys. | [`vaultServer.js`](vaultServer.js) |
| IGA change requests | A role assignment becomes a PENDING change request. It only reaches a token after approval and a token refresh. | [`vaultServer.js`](vaultServer.js), [`src/pages.jsx`](src/pages.jsx) (Quản trị IGA) |

**Why generic OAuth or Keycloak is not enough:** with ordinary IAM, the identity server or the app server ends up holding something that can decrypt, so the operator remains a single point of trust. With TideCloak, the decryption authority is split across the Tide network, and the realm admin's power to change roles is itself gated by IGA.

**Known limits (stated plainly):**
- `selfdecrypt` roles let a user decrypt **their own** data. Sharing a record from Lan to a clinician needs Tide's policy-protected encryption (a signed Forseti policy). The SDK supports passing such a policy, but the policy-creation guide is marked "coming soon", so **clinician sharing in this prototype is simulated** and labelled as such in the UI.
- The local dev realm has an IGA approval threshold of 1 (the dev master admin). A production deployment would use several independent approvers.
- The sidebar item *Chia sẻ cho bác sĩ (MÔ PHỎNG)* is the original UI concept (records, admin view, medical quorum) running on local seed state, labelled as simulated. Every other page calls TideCloak and the vault API for real.

### 5. Prototype & storytelling

**Key interaction for judges:** sign in, then use the sidebar pages *Mã hóa dữ liệu* (encrypt), *Kiểm chứng truy cập* (verify access), *Quản trị IGA* and *Bằng chứng bảo mật* (evidence) with the three personas. The persona shown in the top bar is derived from the roles in the current token.

1. **Lan encrypts and reads her record.** On *Mã hóa dữ liệu* she encrypts a record under tag `cardio`; the storage panel shows only ciphertext and a SHA-256 hash. *Giải mã để kiểm tra* returns her record.
2. **The AI agent is refused.** `agent` holds `_tide_cardio.selfdecrypt`, the same role Lan has. It downloads the same blob (same hash) and calls *doDecrypt*. Expected: the Tide network refuses.
3. **The admin cannot quietly grant themselves access.** `sysadmin` is refused. They request a role, which appears as a **pending** IGA change request and is absent from their token. On *Quản trị IGA*, after approval and *Lấy token mới* (new token) the role appears in the token, and decrypting Lan's record is expected to be **still refused**.

Every attempt, including refusals and their error text, is appended to `data/evidence.jsonl`. *Bằng chứng bảo mật* computes the status of each gate (G1–G3) from that log and can export it as JSON.

**Verification status** (updated from `data/evidence.jsonl`):

| Check | Status |
|---|---|
| Realm `carevault` licensed on the Tide network, IGA enabled, tag roles assigned | ✅ Verified via admin API and adapter config (2026-10-22) |
| Lan: encrypt → blob → decrypt | ⏳ Not run yet |
| Agent with decrypt role refused on Lan's blob | ⏳ Not run yet |
| Sysadmin refused; role request pending until approved; still refused after new token | ⏳ Not run yet |
| `npm test` (13 unit tests of access-rule helpers) | ✅ 13/13 pass. These test helper functions, not the Tide flow. |

**Demo video:** `Video.mp4` (to be added, ≤ 2 minutes).

## Setup

**Prerequisites:** Node.js 18+, Docker Desktop, internet access (the realm is licensed on the Tide network).

```bash
# 1. Install
npm install

# 2. Start a local TideCloak
docker run -d --name carevault-tidecloak -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=password \
  tideorg/tidecloak-dev:latest

# 3. Create realm "carevault" (license, IGA, users lan/agent/sysadmin, tag roles)
#    and write public/tidecloak.json. Uses Tide's official playground API helpers.
git clone --depth 1 https://github.com/tide-foundation/tidecloak-playground.git scripts/.playground
npm run tide:init

# 4. Open each printed invite link in its own private window and create a Tide account.

# 5. Run the app (port 5173 is required by the realm's redirect URIs)
npm run dev        # http://localhost:5173
npm test           # unit tests
```

The admin credentials above are for the local dev container only. The vault API in `vaultServer.js` runs inside the Vite dev server and is not part of the production bundle.
