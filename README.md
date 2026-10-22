[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

# 🏥 CareVault — Patient-Sovereign Health Vault

> **RMIT Hackathon 2026 · Challenge 2 (UNLOCKED)**  
> **Repository:** https://github.com/congnghetinhtu/hackathon  
> **Built with:** [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked) · React 19 · Vite

---

## Project overview

**CareVault** is a patient-sovereign health vault where patients retain absolute custody over their sensitive medical records through TideCloak's session-bound end-to-end encryption. Patients selectively disclose specific medical packages to relevant specialists (e.g., Cardiology records to cardiologists, Psychiatric notes to therapists), revoke access instantly with a single click, and eliminate operator "God-mode" so that even hospital database administrators can never read plaintext patient data.

---

### 1. Vision & originality

<!-- What new product, service, experience or way of working are you proposing? What makes your idea distinctive? -->

CareVault shifts the paradigm of healthcare data management from **"Hospital-Centric Custody"** to **"Patient-Sovereign Authority"**:
* **The Traditional Status Quo:** Today, electronic health record (EHR) portals treat the hospital or SaaS cloud provider as the ultimate custodian. Whenever patients need treatment across different clinics, they are forced into an "all-or-nothing" disclosure trap — handing over their entire lifelong medical file or trusting a third-party server with their most intimate records.
* **Our Distinctive Breakthrough:** CareVault introduces **Granular Scoped Disclosure** powered by TideCloak. A patient can share an ECG report with a cardiologist and a knee X-ray with an orthopedic surgeon without either specialist seeing the other's records, and without either specialist ever seeing the patient's confidential psychiatric consultation notes. Furthermore, access is **ephemeral and instantly revocable** at the cryptographic level.

---

### 2. Trust constraint insight

<!-- What is difficult, risky or impossible today because trust, privacy or security gets in the way? Explain what becomes possible when that constraint is removed. -->

* **The Trust Constraint Today:** Patients avoid seeking timely medical attention for sensitive conditions (mental health issues, infectious diseases, reproductive health, addiction treatment) out of legitimate fear of data breaches, workplace discrimination, insurance denial, or social stigmatization.
* **The "Admin God-Mode" Bottleneck:** In standard healthcare architectures, central database administrators (DBAs) and cloud operators hold master credentials and root access keys. A single compromised sysadmin or SQL-injection vulnerability exposes millions of plaintext health records.
* **What Becomes Possible When Removed:** By removing the unilateral trust bottleneck, patients can safely digitize and share their deepest medical concerns. Multi-institutional research and cross-hospital consultations can take place seamlessly because no central operator or malicious insider can unilaterally breach patient confidentiality.

---

### 3. Value & impact

<!-- Who would benefit, and how would their lives or work improve? Give a concrete example of why this matters. -->

* **For Patients:** Reclaims absolute autonomy over personal health history. A concrete example: A university student struggling with clinical anxiety can share diagnostic notes exclusively with their licensed therapist while attending routine orthopedic physical therapy for a sports injury, with mathematically guaranteed peace of mind that the physical therapist cannot view their psychological file.
* **For Clinicians & Healthcare Providers:** Dramatically lowers liability. Doctors receive only the precise medical scope necessary for diagnosis, reducing diagnostic noise and legal exposure.
* **For Hospital Organizations & Society:** Eliminates catastrophic ransomware and data-breach extortion risks. Because databases hold only fragmented cryptographic ciphertext without server-side master keys, compromised hospital databases are completely worthless to cybercriminals.
* **Regulatory Compliance by Design:** Natively aligns with international and national health privacy mandates:
  * **HIPAA Security & Privacy Rule (45 CFR § 164.312)** on transmission security and minimum necessary access.
  * **GDPR Article 9** protecting Special Category Health Data.
  * **Vietnam Law on Medical Examination and Treatment 2023 (Article 69)** protecting patients' statutory rights to medical privacy.

---

### 4. Why TideCloak matters

<!-- How does your application use TideCloak, and how does that integration help enable your idea? Connect the technology to the possibility you are demonstrating. -->

CareVault cannot be credibly built with generic OAuth, Keycloak, or standard cloud databases because traditional IAM models still place trust in a central token-signing server and server-side decryption keys. TideCloak materially changes what is possible through three fundamental architectural pillars:

```
[Patient Browser] ──(Session-Bound E2EE via TideCloak)──► [Decentralized Fabric]
       │                                                         │
       ├──► Cardiological Scope  ──────► Dr. Minh (Cardiologist) ─── [DECRYPTED ✓]
       ├──► Orthopedic Scope     ──────► Dr. Hung (Orthopedist)  ─── [DECRYPTED ✓]
       └──► Psychiatric Scope    ──────► Dr. An (Psychiatrist)   ─── [DECRYPTED ✓]
                                               ▲
[Hospital SysAdmin / Database Host] ───────────┴──────────────────── [BLOCKED ❌]
(Zero-Knowledge: No Master Key exists on server; Operator is mathematically blind)
```

1. **Ineffable Cryptography & Never-Whole-Key Model:** Master decryption keys never exist in complete form on any single server or database. Distributed Key Generation (DKG) across Orchestrated Recluders of Keys (ORK) ensures no rogue employee or hacker can extract a universal decryption key.
2. **Session-Bound Hermetic E2EE:** Medical records are encrypted directly on the client. Decryption tokens are bound to active user sessions and specific medical specialty claims. When a patient clicks "Revoke", TideCloak invalidates future decryption grants across the Fabric instantly.
3. **Quorum Medical Governance:** To prevent rogue physicians or compromised accounts from retroactively tampering with prescription histories or surgical notes to conceal malpractice, CareVault enforces **Quorum Threshold Governance (2/3 multi-approver consensus)** through an independent Medical Ethics Panel before any diagnosis alteration can be applied.

---

### 5. Prototype & storytelling

<!-- What does your prototype demonstrate today? Describe the key interaction judges should look for. -->

Our prototype demonstrates four key interactions in an intuitive Medical Dashboard:

1. **Selective Scoped Disclosure:** Log in as **Dr. Tran Van Minh (Cardiologist)** → Open the Cardiology record to inspect a live dynamic ECG waveform. Next, attempt to open the patient's confidential Psychiatric Consultation file → **TideCloak immediately blocks access** (`Unauthorized Specialty Scope`) and displays only encrypted ciphertext.
2. **Zero-Knowledge Operator Proof:** Switch to **Hospital SysAdmin (Taylor Reed)** and inspect the "Zero-Knowledge Database View" → All records in the database are visible strictly as raw cryptographic hashes (`0x8F9B...`). Click the test button *"Attempt Admin Master-Key Decrypt"* → The system demonstrates that **no God-mode backdoor exists**.
3. **Instant Cryptographic Revocation:** Switch back to **Patient (Nguyen Thi Lan)** and click *"Revoke"* on the Cardiology record → Switch back to Dr. Minh and refresh → Access is instantaneously revoked by the Fabric.
4. **Quorum Malpractice Defense:** A doctor submits an amendment request to alter a prescription → The modification is held in pending status until approved by **Prof. Dr. Amara Okafor (Medical Ethics Chair)**, preventing unilateral tampering.
5. **Live Cryptographic Audit Trail:** Every encryption event, token verification, blocked override, and quorum signature is streamed in real-time on the live audit panel.

---

## 🛡️ Red-Team Security Assessment

CareVault was subjected to simulated internal threat scenarios:

| Attack Vector | Attacker Persona | Traditional Outcome | CareVault with TideCloak Outcome |
| :--- | :--- | :--- | :--- |
| **Database Root Breach** | Rogue DBA / Host Hacker | Full dump of plaintext patient records | **BLOCKED.** Database contains only ciphertext; keys are non-reconstructable on server. |
| **Post-Revocation Replay** | Dismissed Doctor | Cached session token used to access records | **BLOCKED.** Tide Fabric refuses session re-issuance upon patient revocation. |
| **Unilateral Malpractice Coverup** | Compromised Physician | Silently altered surgical notes in DB | **BLOCKED.** Quorum policy rejects single-party write; requires 2-of-3 panel co-signatures. |

---

## 🚀 Setup & Running the Prototype

### Prerequisites
* [Node.js](https://nodejs.org/) v18+ 
* [Docker Desktop](https://www.docker.com/) (Optional: for local TideCloak container)

### Step 1: Install Dependencies
```bash
git clone https://github.com/congnghetinhtu/hackathon.git carevault
cd carevault
npm install
```

### Step 2: Run Unit Tests (TDD Verification)
Verify that all cryptographic access-control constraints, revocation logic, and quorum threshold rules pass 100%:
```bash
npm test
```

### Step 3: Run the Prototype
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

> **Note for Judges:** You can immediately test the interactive scenario with full simulated Tide session enclaves, or run the official TideCloak Docker dev container:
> ```bash
> docker run -d -p 8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=password tideorg/tidecloak-dev:latest
> ```

---

## 👥 Submission Information
* **Challenge:** Challenge 2 — Vibe code a working app with TideCloak (UNLOCKED)
* **Demo Video:** [Video.mp4](./Video.mp4) (Direct 2-minute MP4 demonstration in root)
* **Team:** RMIT University
