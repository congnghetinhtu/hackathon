import React, { useState } from "react";
import { useVault, computeGates, shortId, short, formatTime, personaLabel, tagLabel, TAG_LABELS, SAMPLE_RECORDS } from "./vault.jsx";
import { useLang, LangToggle } from "./i18n.jsx";

// ---------- shared pieces ----------

export function Pill({ tone = "neutral", children }) {
  return <span className={`cv-pill cv-pill-${tone}`}>{children}</span>;
}

export function PageHeader({ kicker, title, children, actions }) {
  return (
    <div className="cv-page-header">
      <div>
        {kicker && <div className="cv-kicker">{kicker}</div>}
        <h1 className="cv-h1">{title}</h1>
        {children && <p className="cv-lede">{children}</p>}
      </div>
      {actions && <div className="cv-actions">{actions}</div>}
    </div>
  );
}

function Card({ title, aside, children, className = "" }) {
  return (
    <section className={`cv-card ${className}`}>
      {(title || aside) && (
        <div className="cv-card-head">
          {title && <h2 className="cv-h2">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="cv-card cv-stat">
      <span className="cv-label">{label}</span>
      <span className={`cv-stat-value ${tone ? `cv-text-${tone}` : ""}`}>{value}</span>
      {sub && <span className="cv-mono cv-muted">{sub}</span>}
    </div>
  );
}

function Cipher({ text, n = 160 }) {
  return <div className="cv-cipher">{short(text, n)}</div>;
}

function Result({ result }) {
  const { t, lang } = useLang();
  if (!result) return null;
  return (
    <div className={`cv-banner ${result.ok ? "cv-banner-ok" : "cv-banner-bad"}`}>
      <strong>{result.ok ? t("Giải mã thành công", "Decryption succeeded") : t("Tide từ chối giải mã", "Tide refused to decrypt")}</strong>
      <span className="cv-muted"> · {shortId(result.by)} · {formatTime(result.at, lang)}</span>
      <div className="cv-mono cv-break">{result.text}</div>
    </div>
  );
}

function Empty({ children }) {
  return <p className="cv-empty">{children}</p>;
}

function Roles({ roles }) {
  const { t } = useLang();
  return roles.length ? roles.map((r) => <code key={r} className="cv-code">{r}</code>) : <em>{t("không có", "none")}</em>;
}

function useLatestOwnBlob() {
  const { blobs, username } = useVault();
  return blobs.find((b) => b.owner === username) || blobs[0];
}

// ---------- login ----------

export function LoginPage() {
  const { login, isLoading, initError } = useVault();
  const { t } = useLang();
  return (
    <div className="cv-login">
      <div className="cv-login-brand">
        <div className="cv-kicker cv-on-dark">RMIT Hackathon 2026 · Challenge 2</div>
        <div className="cv-logo-lg">CareVault</div>
        <h1 className="cv-login-title">
          {t("Hồ sơ y tế của bạn.", "Your health records.")}
          <br />
          <span>{t("Chỉ bạn mở được.", "Only you can open them.")}</span>
        </h1>
        <p className="cv-on-dark-muted">
          {t(
            "Hồ sơ được mã hóa ngay trên trình duyệt bằng TideCloak. Máy chủ, quản trị viên và AI agent chỉ giữ ciphertext.",
            "Records are encrypted in your browser with TideCloak. Servers, administrators and AI agents only ever hold ciphertext."
          )}
        </p>
        <div className="cv-flow">
          <div>
            <strong>{t("Trình duyệt", "Browser")}</strong>
            <span>{t("mã hóa / giải mã", "encrypts / decrypts")}</span>
          </div>
          <div>
            <strong>{t("Mạng Tide", "Tide network")}</strong>
            <span>{t("quyết định ai được mở", "decides who may open")}</span>
          </div>
          <div>
            <strong>{t("Máy chủ", "Server")}</strong>
            <span>{t("chỉ thấy ciphertext", "sees only ciphertext")}</span>
          </div>
        </div>
      </div>
      <div className="cv-login-panel">
        <div className="cv-row cv-between">
          <h2 className="cv-h1">{t("Đăng nhập", "Sign in")}</h2>
          <LangToggle />
        </div>
        <p className="cv-lede">{t("Đăng nhập bằng tài khoản Tide. CareVault không lưu mật khẩu của bạn.", "Sign in with your Tide account. CareVault never stores your password.")}</p>
        <button className="cv-btn cv-btn-primary cv-btn-block" onClick={() => login()} disabled={isLoading}>
          {isLoading ? t("Đang kết nối TideCloak…", "Connecting to TideCloak…") : t("Đăng nhập bằng TideCloak", "Sign in with TideCloak")}
        </button>
        <div className="cv-note">
          {t(
            "Không có bước chọn vai trò ở đây: TideCloak gán role cho từng tài khoản, và vai trò của bạn được đọc từ token sau khi đăng nhập. Muốn đổi vai trò thì đăng nhập bằng tài khoản khác hoặc xin role qua IGA.",
            "There is no role picker here: TideCloak assigns roles to each account and your access comes from the token after sign-in. To act as someone else, sign in with another account or request a role through IGA."
          )}
        </div>
        {initError && (
          <div className="cv-banner cv-banner-bad">
            {t("Không kết nối được TideCloak:", "Could not reach TideCloak:")} {String(initError.message || initError)}
          </div>
        )}
        <div className="cv-pillars">
          <div>
            <strong>{t("Mã hóa trên trình duyệt", "Encrypted in the browser")}</strong>
            <span>{t("Bản rõ không rời khỏi máy của bạn.", "Plaintext never leaves your device.")}</span>
          </div>
          <div>
            <strong>{t("Admin và AI agent không đọc được", "Admins and AI agents can't read it")}</strong>
            <span>{t("Giữ được dữ liệu khác với đọc được dữ liệu.", "Holding data is not reading data.")}</span>
          </div>
          <div>
            <strong>{t("Đổi quyền phải được duyệt", "Role changes need approval")}</strong>
            <span>{t("IGA ghi nhận mọi thay đổi role.", "IGA records every role change.")}</span>
          </div>
        </div>
        <p className="cv-muted cv-small">{t("Dữ liệu trong bản demo là giả lập. Built with TideCloak.", "All demo data is synthetic. Built with TideCloak.")}</p>
      </div>
    </div>
  );
}

// ---------- overview ----------

export function OverviewPage({ go }) {
  const { blobs, evidence, tideRoles, persona, username, config, personas } = useVault();
  const { t } = useLang();
  const verified = evidence.filter((e) => e.verified);
  const ok = verified.filter((e) => e.event === "DECRYPT_OK").length;
  const denied = verified.filter((e) => e.event === "DECRYPT_DENIED").length;
  const gates = computeGates(evidence, blobs, personas, t);
  return (
    <>
      <div className="cv-card cv-hero">
        <div>
          <div className="cv-row">
            <Pill tone="ok">{t("TIDE THẬT", "REAL TIDE")}</Pill>
            <span className="cv-mono cv-muted">realm {config.realm || "carevault"}</span>
          </div>
          <h1 className="cv-h1">{t("Xin chào", "Hello")}, {shortId(username)}</h1>
          <p className="cv-lede">
            {t("Vai trò demo của tài khoản này:", "Demo persona of this account:")} {persona}.{" "}
            {t(
              "Quyền giải mã thật do mạng Tide quyết định theo token, không theo nhãn này.",
              "Real decryption rights are decided by the Tide network from the token, not by this label."
            )}
          </p>
        </div>
        <div className="cv-actions">
          <button className="cv-btn cv-btn-primary" onClick={() => go("encrypt")}>{t("Tạo và mã hóa hồ sơ mới", "Create and encrypt a record")}</button>
          <button className="cv-btn" onClick={() => go("evidence")}>{t("Xem bằng chứng", "View evidence")}</button>
        </div>
      </div>

      <div className="cv-grid-4">
        <Stat label={t("Hồ sơ trong kho", "Records in vault")} value={blobs.length} sub={t("chỉ ciphertext + sha256", "ciphertext + sha256 only")} />
        <Stat label={t("Giải mã thành công", "Decryptions succeeded")} value={ok} tone="ok" sub={t("bản ghi đã xác minh", "verified entries")} />
        <Stat label={t("Bị Tide từ chối", "Refused by Tide")} value={denied} tone="bad" sub={t("bản ghi đã xác minh", "verified entries")} />
        <Stat
          label={t("Ngưỡng ORK của realm", "Realm ORK threshold")}
          value={config.thresholdT && config.thresholdN ? `${config.thresholdT}/${config.thresholdN}` : "?"}
          sub={t("node Tide cần đồng ý", "Tide nodes must agree")}
        />
      </div>

      <div className="cv-split">
        <Card title={t("Hồ sơ gần đây", "Recent records")} aside={<button className="cv-link" onClick={() => go("records")}>{t("Xem tất cả", "View all")}</button>}>
          <RecordTable rows={blobs.slice(0, 5)} />
        </Card>
        <div className="cv-stack">
          <Card title={t("Phiên TideCloak", "TideCloak session")}>
            <dl className="cv-dl">
              <dt>{t("Người dùng", "User")}</dt>
              <dd className="cv-mono" title={username}>{shortId(username)}</dd>
              <dt>{t("Role Tide", "Tide roles")}</dt>
              <dd><Roles roles={tideRoles} /></dd>
              <dt>ORK</dt>
              <dd className="cv-mono">{config.homeOrkUrl || config.orkUrl || "?"}</dd>
            </dl>
          </Card>
          <Card title={t("Các cổng kiểm chứng", "Verification gates")}>
            {gates.map((g) => (
              <div key={g.id} className="cv-gate-row">
                <span className="cv-mono">{g.id}</span>
                <span className="cv-grow">{g.title}</span>
                <GateStatus status={g.status} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

function GateStatus({ status }) {
  const { t } = useLang();
  if (status === "pass") return <Pill tone="ok">{t("ĐÃ CÓ BẰNG CHỨNG", "EVIDENCE RECORDED")}</Pill>;
  if (status === "partial") return <Pill tone="warn">{t("ĐANG LÀM", "IN PROGRESS")}</Pill>;
  if (status === "blocked") return <Pill tone="bad">{t("CHƯA ĐẠT", "NOT ACHIEVED")}</Pill>;
  return <Pill>{t("CHƯA CHẠY", "NOT RUN")}</Pill>;
}

function RecordTable({ rows }) {
  const { decrypt, busy, results, username } = useVault();
  const { t, lang } = useLang();
  if (!rows.length) return <Empty>{t("Chưa có hồ sơ nào. Vào “Mã hóa dữ liệu” để tạo hồ sơ đầu tiên.", "No records yet. Use “Encrypt data” to create the first one.")}</Empty>;
  return (
    <div className="cv-table-wrap">
      <table className="cv-table">
        <thead>
          <tr>
            <th>{t("Hồ sơ", "Record")}</th>
            <th>{t("Blob và hash", "Blob and hash")}</th>
            <th>{t("Chủ sở hữu", "Owner")}</th>
            <th>{t("Tạo lúc", "Created")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <React.Fragment key={b.id}>
              <tr>
                <td>
                  <strong>{b.label}</strong>
                  <div><Pill>{b.tag} · {tagLabel(b.tag, t)}</Pill></div>
                </td>
                <td className="cv-mono">
                  {b.id}
                  <div className="cv-muted">sha256 {b.sha256.slice(0, 12)}…</div>
                </td>
                <td className="cv-mono" title={b.owner}>{b.owner === username ? t("tôi", "me") : shortId(b.owner)}</td>
                <td>{formatTime(b.createdAt, lang)}</td>
                <td className="cv-right">
                  <button className="cv-btn cv-btn-primary cv-btn-sm" onClick={() => decrypt(b)} disabled={busy === b.id}>
                    {busy === b.id ? t("Đang hỏi mạng Tide…", "Asking the Tide network…") : t("Giải mã", "Decrypt")}
                  </button>
                </td>
              </tr>
              {results[b.id] && (
                <tr>
                  <td colSpan={5}>
                    <Result result={results[b.id]} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- records ----------

export function RecordsPage() {
  const { blobs, results, reload } = useVault();
  const { t } = useLang();
  const [selected, setSelected] = useState(null);
  const blob = blobs.find((b) => b.id === selected) || blobs[0];
  const result = blob && results[blob.id];
  return (
    <>
      <PageHeader
        kicker={t("Kho hồ sơ · Tide thật", "Vault · real Tide")}
        title={t("Hồ sơ mã hóa", "Encrypted records")}
        actions={<button className="cv-btn" onClick={reload}>{t("Tải lại", "Reload")}</button>}
      >
        {t(
          "Máy chủ chỉ lưu ciphertext và mã băm. Bấm “Giải mã” để yêu cầu mạng Tide mở hồ sơ với tư cách người đang đăng nhập.",
          "The server stores only ciphertext and a hash. Press “Decrypt” to ask the Tide network to open a record as the signed-in user."
        )}
      </PageHeader>
      <Card title={t("Danh mục hồ sơ", "Record list")}>
        <RecordTable rows={blobs} />
      </Card>
      {blob && (
        <Card
          title={t("So sánh hai góc nhìn", "Two points of view")}
          aside={
            <select className="cv-input cv-select-sm" value={blob.id} onChange={(e) => setSelected(e.target.value)} aria-label={t("Chọn hồ sơ", "Choose record")}>
              {blobs.map((b) => (
                <option key={b.id} value={b.id}>{b.id} · {b.label}</option>
              ))}
            </select>
          }
        >
          <div className="cv-grid-2">
            <div className="cv-panel">
              <div className="cv-label">{t("Trình duyệt của bạn (sau khi giải mã)", "Your browser (after decryption)")}</div>
              {result ? <Result result={result} /> : <Empty>{t("Chưa giải mã hồ sơ này trong phiên hiện tại.", "Not decrypted in this session yet.")}</Empty>}
            </div>
            <div className="cv-panel cv-panel-dark">
              <div className="cv-label cv-on-dark">{t("Máy chủ lưu trữ thấy", "What the storage server sees")}</div>
              <Cipher text={blob.ciphertext} n={400} />
              <div className="cv-mono cv-on-dark-muted">sha256 {blob.sha256}</div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

// ---------- encrypt ----------

export function EncryptPage({ go }) {
  const { encrypt, busy, decrypt, results, tideRoles } = useVault();
  const { t } = useLang();
  const [tag, setTag] = useState("cardio");
  const [title, setTitle] = useState(SAMPLE_RECORDS.cardio.title);
  const [body, setBody] = useState(SAMPLE_RECORDS.cardio.body);
  const [created, setCreated] = useState(null);
  const canEncrypt = tideRoles.includes(`_tide_${tag}.selfencrypt`);
  const step = created ? (results[created.id] ? 4 : 3) : busy === "encrypt" ? 2 : 1;

  async function submit(e) {
    e.preventDefault();
    const blob = await encrypt(tag, title, body);
    if (blob && blob.id) setCreated(blob);
  }

  const steps = [
    t("Nhập nội dung", "Enter content"),
    t("Mã hóa qua mạng Tide", "Encrypt via Tide"),
    t("Lưu ciphertext vào kho", "Store ciphertext"),
    t("Thử giải mã lại", "Decrypt to check"),
  ];
  return (
    <>
      <PageHeader kicker={t("Mã hóa dữ liệu · Tide thật", "Encrypt data · real Tide")} title={t("Mã hóa và lưu hồ sơ", "Encrypt and store a record")}>
        {t(
          "Nội dung được mã hóa bằng doEncrypt ngay trên trình duyệt. Kho chỉ nhận ciphertext.",
          "Content is encrypted with doEncrypt in the browser. The vault only receives ciphertext."
        )}
      </PageHeader>
      <div className="cv-card cv-stepper">
        {steps.map((s, i) => (
          <div key={s} className={`cv-step ${step > i + 1 ? "done" : step === i + 1 ? "active" : ""}`}>
            <span className="cv-step-num">{i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
      <div className="cv-grid-2">
        <Card title={t("Trình duyệt của bạn (bản rõ)", "Your browser (plaintext)")}>
          <form onSubmit={submit} className="cv-form">
            <label className="cv-label">{t("Loại hồ sơ (tag)", "Record type (tag)")}</label>
            <div className="cv-segment">
              {Object.keys(TAG_LABELS).map((tg) => (
                <button
                  type="button"
                  key={tg}
                  className={tag === tg ? "active" : ""}
                  onClick={() => {
                    setTag(tg);
                    setTitle(SAMPLE_RECORDS[tg].title);
                    setBody(SAMPLE_RECORDS[tg].body);
                  }}
                >
                  {tg} · {tagLabel(tg, t)}
                </button>
              ))}
            </div>
            <label className="cv-label" htmlFor="cv-title">{t("Tiêu đề", "Title")}</label>
            <input id="cv-title" className="cv-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="cv-label" htmlFor="cv-body">{t("Nội dung (giả lập)", "Content (synthetic)")}</label>
            <textarea id="cv-body" className="cv-input cv-mono" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="cv-note">
              {t(
                "Bản rõ chỉ nằm trong bộ nhớ trình duyệt. Máy chủ CareVault không nhận chuỗi này.",
                "Plaintext stays in browser memory. The CareVault server never receives it."
              )}
            </div>
            {!canEncrypt && (
              <div className="cv-banner cv-banner-warn">
                {t("Token hiện tại không có role", "The current token lacks")} <code className="cv-code">_tide_{tag}.selfencrypt</code>.{" "}
                {t("Tide sẽ từ chối mã hóa.", "Tide will refuse to encrypt.")}
              </div>
            )}
            <button className="cv-btn cv-btn-primary cv-btn-block" type="submit" disabled={busy === "encrypt"}>
              {busy === "encrypt" ? t("Đang mã hóa qua mạng Tide…", "Encrypting via Tide…") : t(`Mã hóa (tag ${tag}) và lưu vào kho`, `Encrypt (tag ${tag}) and store`)}
            </button>
          </form>
        </Card>
        <Card title={t("Máy chủ lưu trữ (chỉ ciphertext)", "Storage server (ciphertext only)")}>
          {!created ? (
            <Empty>{t("Chưa có bản mã hóa trong phiên này.", "Nothing encrypted in this session yet.")}</Empty>
          ) : (
            <div className="cv-form">
              <div className="cv-banner cv-banner-ok">{t("Đã lưu", "Stored")} {created.id}</div>
              <span className="cv-label">SHA-256</span>
              <div className="cv-mono cv-break">{created.sha256}</div>
              <span className="cv-label">{t("Ciphertext do Tide tạo", "Ciphertext produced by Tide")}</span>
              <Cipher text={created.ciphertext} n={360} />
              <div className="cv-row">
                <button className="cv-btn cv-btn-primary" onClick={() => decrypt(created)} disabled={busy === created.id}>
                  {t("Giải mã để kiểm tra", "Decrypt to check")}
                </button>
                <button className="cv-btn" onClick={() => go("records")}>{t("Xem trong kho", "View in vault")}</button>
              </div>
              <Result result={results[created.id]} />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

// ---------- verify ----------

export function VerifyPage() {
  const { blobs, decrypt, busy, results, username, tideRoles, persona } = useVault();
  const { t } = useLang();
  const fallback = useLatestOwnBlob();
  const [selected, setSelected] = useState(null);
  const [fetched, setFetched] = useState(null);
  const blob = blobs.find((b) => b.id === selected) || fallback;

  async function fetchBlob() {
    const started = performance.now();
    const r = await fetch("/api/blobs");
    const list = await r.json();
    const found = list.find((b) => b.id === blob.id);
    setFetched({ status: r.status, bytes: found ? found.ciphertext.length : 0, ms: Math.round(performance.now() - started) });
  }

  const result = blob && results[blob.id];
  return (
    <>
      <PageHeader kicker={t("Kiểm chứng truy cập · Tide thật", "Verify access · real Tide")} title={t("Tải được bản mã khác với đọc được dữ liệu", "Downloading ciphertext is not reading data")}>
        {t(
          "Đăng nhập bằng tài khoản agent hoặc sysadmin, tải cùng blob của chủ hồ sơ, rồi yêu cầu Tide giải mã.",
          "Sign in as the agent or sysadmin account, download the owner's blob, then ask Tide to decrypt it."
        )}
      </PageHeader>
      <div className="cv-card cv-identity">
        <div>
          <div className="cv-label">{t("Danh tính đang kiểm thử", "Identity under test")}</div>
          <div className="cv-h2 cv-mono" title={username}>{shortId(username)}</div>
          <div>{persona}</div>
        </div>
        <div>
          <div className="cv-label">{t("Role Tide trong token", "Tide roles in token")}</div>
          <div><Roles roles={tideRoles} /></div>
        </div>
        <div>
          <div className="cv-label">{t("Hồ sơ mục tiêu", "Target record")}</div>
          {blobs.length ? (
            <select className="cv-input" value={blob?.id} onChange={(e) => { setSelected(e.target.value); setFetched(null); }} aria-label={t("Chọn hồ sơ", "Choose record")}>
              {blobs.map((b) => (
                <option key={b.id} value={b.id}>{b.id} · {b.label} · {shortId(b.owner)}</option>
              ))}
            </select>
          ) : (
            <em>{t("chưa có blob", "no blobs yet")}</em>
          )}
        </div>
      </div>
      {blob && (
        <div className="cv-grid-2">
          <Card title={t("Giai đoạn 1 · Tải bản mã", "Step 1 · Download ciphertext")} aside={fetched && <Pill tone="ok">HTTP {fetched.status}</Pill>}>
            <dl className="cv-dl">
              <dt>{t("Chủ sở hữu", "Owner")}</dt>
              <dd className="cv-mono">{shortId(blob.owner)}{blob.owner === username ? t(" (là tôi)", " (me)") : ""}</dd>
              <dt>Blob</dt>
              <dd className="cv-mono">{blob.id}</dd>
              <dt>{t("Kích thước", "Size")}</dt>
              <dd className="cv-mono">{fetched ? `${fetched.bytes} ${t("ký tự", "chars")} · ${fetched.ms} ms` : t("chưa tải", "not downloaded")}</dd>
              <dt>SHA-256</dt>
              <dd className="cv-mono cv-break">{blob.sha256}</dd>
            </dl>
            <Cipher text={blob.ciphertext} n={240} />
            <button className="cv-btn" onClick={fetchBlob}>{t("Tải ciphertext từ kho", "Download ciphertext")}</button>
          </Card>
          <Card
            title={t("Giai đoạn 2 · Yêu cầu Tide giải mã", "Step 2 · Ask Tide to decrypt")}
            aside={result && <Pill tone={result.ok ? "ok" : "bad"}>{result.ok ? t("THÀNH CÔNG", "SUCCEEDED") : t("BỊ TỪ CHỐI", "REFUSED")}</Pill>}
          >
            <p className="cv-muted">
              {t(
                "doDecrypt gửi yêu cầu tới mạng Tide với token hiện tại. Kết quả bên dưới là phản hồi thật, được ghi vào nhật ký bằng chứng.",
                "doDecrypt sends the request to the Tide network with the current token. The result below is the real response and is written to the evidence log."
              )}
            </p>
            <button className="cv-btn cv-btn-primary" onClick={() => decrypt(blob)} disabled={busy === blob.id}>
              {busy === blob.id ? t("Đang hỏi mạng Tide…", "Asking the Tide network…") : `doDecrypt ${t("với tư cách", "as")} ${shortId(username)}`}
            </button>
            {result ? <Result result={result} /> : <Empty>{t("Chưa thử giải mã.", "Not attempted yet.")}</Empty>}
          </Card>
        </div>
      )}
      <Card title={t("Cách đọc kết quả", "How to read the result")}>
        <div className="cv-table-wrap">
          <table className="cv-table">
            <thead>
              <tr>
                <th>{t("Tình huống", "Case")}</th>
                <th>{t("Tải ciphertext", "Download ciphertext")}</th>
                <th>{t("Giải mã", "Decrypt")}</th>
                <th>{t("Ý nghĩa", "Meaning")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("Chủ hồ sơ", "Record owner")}</td>
                <td>{t("Được", "Yes")}</td>
                <td><Pill tone="ok">{t("Được", "Allowed")}</Pill></td>
                <td>{t("Dữ liệu là của chính người này.", "The data belongs to this user.")}</td>
              </tr>
              <tr>
                <td>{t("AI agent có role giải mã", "AI agent with decrypt role")}</td>
                <td>{t("Được", "Yes")}</td>
                <td><Pill tone="bad">{t("Từ chối (kỳ vọng)", "Refused (expected)")}</Pill></td>
                <td>{t("Role selfdecrypt chỉ mở dữ liệu của chính mình.", "selfdecrypt only opens the caller's own data.")}</td>
              </tr>
              <tr>
                <td>SysAdmin</td>
                <td>{t("Được", "Yes")}</td>
                <td><Pill tone="bad">{t("Từ chối (kỳ vọng)", "Refused (expected)")}</Pill></td>
                <td>{t("Quyền quản trị không đồng nghĩa với quyền đọc.", "Admin power is not read access.")}</td>
              </tr>
              <tr>
                <td>{t("Lỗi mạng / cấu hình", "Network / config error")}</td>
                <td>{t("Có thể lỗi", "May fail")}</td>
                <td><Pill tone="warn">{t("Lỗi kỹ thuật", "Technical error")}</Pill></td>
                <td>{t("Không phải bằng chứng bảo mật; đọc kỹ thông báo lỗi.", "Not security evidence; read the error message.")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// ---------- IGA ----------

export function IgaPage() {
  const { requestRole, loadPending, pending, approve, refreshToken, tideRoles, issuedAt, username, evidence } = useVault();
  const { t, lang } = useLang();
  const [user, setUser] = useState("");
  const [role, setRole] = useState("_tide_cardio.selfdecrypt");
  const lastRefresh = evidence.find((e) => e.event === "TOKEN_REFRESHED" && e.actor === username);
  return (
    <>
      <PageHeader kicker={t("Quản trị IGA · Tide thật", "IGA governance · real Tide")} title={t("Đổi quyền phải qua change request", "Role changes go through a change request")}>
        {t(
          "Gán role không có hiệu lực ngay. TideCloak tạo một change request đang chờ, chỉ vào token sau khi được duyệt và lấy token mới.",
          "Assigning a role does not apply immediately. TideCloak creates a pending change request; it reaches the token only after approval and a token refresh."
        )}
      </PageHeader>
      <div className="cv-banner cv-banner-warn">
        {t(
          "Môi trường dev: ngưỡng duyệt là 1 quản trị viên (admin master của container). Triển khai thật cần nhiều người duyệt độc lập.",
          "Dev environment: the approval threshold is 1 administrator (the container's master admin). A real deployment needs several independent approvers."
        )}
      </div>
      <div className="cv-grid-2">
        <Card title={t("1 · Yêu cầu gán role", "1 · Request a role")}>
          <div className="cv-form">
            <label className="cv-label" htmlFor="cv-iga-user">{t("Người dùng", "User")}</label>
            <input id="cv-iga-user" className="cv-input cv-mono" value={user} placeholder={`${t("mặc định: tôi", "default: me")} (${shortId(username)})`} onChange={(e) => setUser(e.target.value)} />
            <label className="cv-label" htmlFor="cv-iga-role">Role</label>
            <select id="cv-iga-role" className="cv-input cv-mono" value={role} onChange={(e) => setRole(e.target.value)}>
              {["cardio", "psych"].flatMap((tg) => [`_tide_${tg}.selfdecrypt`, `_tide_${tg}.selfencrypt`]).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button className="cv-btn cv-btn-primary" onClick={() => requestRole(user, role)}>{t("Gửi yêu cầu", "Submit request")}</button>
          </div>
        </Card>
        <Card title={t("2 · Change request đang chờ", "2 · Pending change requests")} aside={<button className="cv-btn cv-btn-sm" onClick={loadPending}>{t("Tải danh sách", "Load list")}</button>}>
          {!pending && <Empty>{t("Bấm “Tải danh sách” để xem.", "Press “Load list” to view.")}</Empty>}
          {Array.isArray(pending) && pending.length === 0 && <Empty>{t("Không có change request nào đang chờ.", "No pending change requests.")}</Empty>}
          {Array.isArray(pending) &&
            pending.map((cr) => (
              <div key={cr.id} className="cv-cr">
                <div>
                  <Pill tone="warn">{t("ĐANG CHỜ", "PENDING")}</Pill> <span className="cv-mono">{cr.id}</span>
                  <div className="cv-mono cv-muted cv-break">{short(JSON.stringify(cr), 200)}</div>
                </div>
                <button className="cv-btn cv-btn-primary cv-btn-sm" onClick={() => approve(cr.id)}>{t("Duyệt", "Approve")}</button>
              </div>
            ))}
          {pending && !Array.isArray(pending) && <pre className="cv-pre">{JSON.stringify(pending, null, 2)}</pre>}
        </Card>
      </div>
      <Card
        title={t("3 · Lấy token mới và so sánh role", "3 · Refresh the token and compare roles")}
        aside={<button className="cv-btn cv-btn-primary cv-btn-sm" onClick={refreshToken}>{t("Lấy token mới", "Refresh token")}</button>}
      >
        <div className="cv-grid-2">
          <div className="cv-panel cv-panel-dark">
            <div className="cv-label cv-on-dark">{t("Token trước (lần làm mới gần nhất)", "Previous token (last refresh)")}</div>
            <pre className="cv-pre-dark">{JSON.stringify({ roles: lastRefresh ? lastRefresh.rolesBefore : t("chưa làm mới", "not refreshed yet") }, null, 2)}</pre>
          </div>
          <div className="cv-panel cv-panel-dark">
            <div className="cv-label cv-on-dark">
              {t("Token hiện tại", "Current token")} · iat {issuedAt ? new Date(issuedAt * 1000).toLocaleTimeString(lang === "en" ? "en-GB" : "vi-VN") : "?"}
            </div>
            <pre className="cv-pre-dark">{JSON.stringify({ sub: shortId(username), roles: tideRoles }, null, 2)}</pre>
          </div>
        </div>
        <p className="cv-muted">
          {t(
            "4 · Sau khi có role mới, vào “Kiểm chứng truy cập” và thử giải mã hồ sơ của Lan một lần nữa.",
            "4 · Once the new role is in the token, go to “Verify access” and try to decrypt Lan's record again."
          )}
        </p>
      </Card>
    </>
  );
}

// ---------- evidence ----------

export function EvidencePage() {
  const { evidence, blobs, reload, personas } = useVault();
  const { t, lang } = useLang();
  const [filter, setFilter] = useState("all");
  const gates = computeGates(evidence, blobs, personas, t);
  const rows = evidence.filter((e) => filter === "all" || e.event === filter);
  const events = Array.from(new Set(evidence.map((e) => e.event)));

  function exportJson() {
    const file = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), gates, evidence }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "carevault-evidence.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <PageHeader
        kicker={t("Bằng chứng bảo mật", "Security evidence")}
        title={t("Bằng chứng từ nhật ký thật", "Evidence from the real log")}
        actions={
          <>
            <button className="cv-btn" onClick={reload}>{t("Tải lại", "Reload")}</button>
            <button className="cv-btn cv-btn-primary" onClick={exportJson}>{t("Xuất JSON", "Export JSON")}</button>
          </>
        }
      >
        {t(
          "Trạng thái cổng chỉ tính các bản ghi đã xác minh: server kiểm tra chữ ký token TideCloak và tự lấy danh tính, role từ token. Cổng nào chưa có sự kiện tương ứng sẽ ghi “Chưa chạy”.",
          "Gate status counts only verified entries: the server checks the TideCloak token signature and takes identity and roles from the token itself. Gates without a matching event show “Not run”."
        )}
      </PageHeader>
      <div className="cv-grid-2">
        {gates.map((g) => (
          <div key={g.id} className={`cv-card cv-gate cv-gate-${g.status}`}>
            <div className="cv-row cv-between">
              <span className="cv-mono cv-kicker">{g.id}</span>
              <GateStatus status={g.status} />
            </div>
            <h3 className="cv-h2">{g.title}</h3>
            <p className="cv-muted">{g.detail}</p>
            {g.proof && (
              <div className="cv-proof">
                <div className="cv-mono">{g.proof.event} · {formatTime(g.proof.at, lang)}</div>
                <div className="cv-mono cv-muted">{shortId(g.proof.actor)} · {personaLabel(personas, g.proof.actor, lang)}</div>
                <div className="cv-mono cv-muted">{t("roles trong token:", "roles in token:")} {JSON.stringify(g.proof.roles || [])}</div>
                {g.proof.error && <div className="cv-mono cv-text-bad cv-break">{short(g.proof.error, 120)}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      <Card
        title={`${t("Nhật ký", "Log")} (${rows.length})`}
        aside={
          <select className="cv-input cv-select-sm" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={t("Lọc sự kiện", "Filter events")}>
            <option value="all">{t("Tất cả sự kiện", "All events")}</option>
            {events.map((ev) => (
              <option key={ev}>{ev}</option>
            ))}
          </select>
        }
      >
        {rows.length === 0 ? (
          <Empty>{t("Chưa có sự kiện nào.", "No events yet.")}</Empty>
        ) : (
          <div className="cv-table-wrap">
            <table className="cv-table">
              <thead>
                <tr>
                  <th>{t("Thời gian", "Time")}</th>
                  <th>{t("Xác minh", "Verified")}</th>
                  <th>{t("Sự kiện", "Event")}</th>
                  <th>{t("Danh tính", "Identity")}</th>
                  <th>{t("Đối tượng", "Target")}</th>
                  <th>{t("Chi tiết", "Details")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e, i) => (
                  <tr key={i}>
                    <td className="cv-mono">{formatTime(e.at, lang)}</td>
                    <td>{e.verified ? <Pill tone="ok">{t("TOKEN ĐÃ KÝ", "SIGNED TOKEN")}</Pill> : <Pill>{t("CŨ · KHÔNG TÍNH", "LEGACY · IGNORED")}</Pill>}</td>
                    <td><Pill tone={e.event.includes("DENIED") || e.event.includes("FAILED") ? "bad" : e.event.startsWith("IGA") ? "warn" : "ok"}>{e.event}</Pill></td>
                    <td className="cv-mono" title={e.actor}>{shortId(e.actor)}</td>
                    <td className="cv-mono">{e.blobId || e.role || e.changeRequestId || ""}</td>
                    <td className="cv-mono cv-muted cv-break">
                      {e.error ? short(e.error, 100) : e.rolesAfter ? `${JSON.stringify(e.rolesBefore)} → ${JSON.stringify(e.rolesAfter)}` : e.httpStatus ? `HTTP ${e.httpStatus}` : e.sha256 ? `sha256 ${e.sha256.slice(0, 12)}…` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <div className="cv-note">
        {t(
          "Giới hạn: danh tính trong mỗi bản ghi đã được server xác minh, nhưng kết quả giải mã (thành công hay bị từ chối) vẫn do chính trình duyệt đã đăng nhập báo lên, vì doDecrypt chạy giữa trình duyệt và mạng Tide. Nhật ký không phải log bất biến độc lập. Bằng chứng mạnh nhất là video quay liền mạch và việc ban giám khảo tự chạy lại các bước.",
          "Limitation: the identity in each entry is verified by the server, but the decrypt outcome (success or refusal) is still reported by the signed-in browser, because doDecrypt runs between the browser and the Tide network. This is not an independent immutable log. The strongest evidence is an uncut video and judges re-running the steps."
        )}
      </div>
    </>
  );
}
