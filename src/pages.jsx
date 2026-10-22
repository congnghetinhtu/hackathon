import React, { useState } from "react";
import { useVault, computeGates, shortId, short, formatTime, personaOf, TAG_LABELS, SAMPLE_RECORDS } from "./vault.jsx";

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
  if (!result) return null;
  return (
    <div className={`cv-banner ${result.ok ? "cv-banner-ok" : "cv-banner-bad"}`}>
      <strong>{result.ok ? "Giải mã thành công" : "Tide từ chối giải mã"}</strong>
      <span className="cv-muted"> · {shortId(result.by)} · {formatTime(result.at)}</span>
      <div className="cv-mono cv-break">{result.text}</div>
    </div>
  );
}

function Empty({ children }) {
  return <p className="cv-empty">{children}</p>;
}

function useLatestOwnBlob() {
  const { blobs, username } = useVault();
  return blobs.find((b) => b.owner === username) || blobs[0];
}

// ---------- login ----------

export function LoginPage() {
  const { login, isLoading, initError } = useVault();
  return (
    <div className="cv-login">
      <div className="cv-login-brand">
        <div className="cv-kicker cv-on-dark">RMIT Hackathon 2026 · Challenge 2</div>
        <div className="cv-logo-lg">CareVault</div>
        <h1 className="cv-login-title">
          Hồ sơ y tế của bạn.
          <br />
          <span>Chỉ bạn mở được.</span>
        </h1>
        <p className="cv-on-dark-muted">
          Hồ sơ được mã hóa ngay trên trình duyệt bằng TideCloak. Máy chủ, quản trị viên và AI agent chỉ giữ ciphertext.
        </p>
        <div className="cv-flow">
          <div>
            <strong>Trình duyệt</strong>
            <span>mã hóa / giải mã</span>
          </div>
          <div>
            <strong>Mạng Tide</strong>
            <span>quyết định ai được mở</span>
          </div>
          <div>
            <strong>Máy chủ</strong>
            <span>chỉ thấy ciphertext</span>
          </div>
        </div>
      </div>
      <div className="cv-login-panel">
        <h2 className="cv-h1">Đăng nhập</h2>
        <p className="cv-lede">Đăng nhập bằng tài khoản Tide. CareVault không lưu mật khẩu của bạn.</p>
        <button className="cv-btn cv-btn-primary cv-btn-block" onClick={() => login()} disabled={isLoading}>
          {isLoading ? "Đang kết nối TideCloak…" : "Đăng nhập bằng TideCloak"}
        </button>
        {initError && <div className="cv-banner cv-banner-bad">Không kết nối được TideCloak: {String(initError.message || initError)}</div>}
        <div className="cv-pillars">
          <div>
            <strong>Mã hóa trên trình duyệt</strong>
            <span>Bản rõ không rời khỏi máy của bạn.</span>
          </div>
          <div>
            <strong>Admin và AI agent không đọc được</strong>
            <span>Giữ được dữ liệu khác với đọc được dữ liệu.</span>
          </div>
          <div>
            <strong>Đổi quyền phải được duyệt</strong>
            <span>IGA ghi nhận mọi thay đổi role.</span>
          </div>
        </div>
        <p className="cv-muted cv-small">Dữ liệu trong bản demo là giả lập. Built with TideCloak.</p>
      </div>
    </div>
  );
}

// ---------- overview ----------

export function OverviewPage({ go }) {
  const { blobs, evidence, tideRoles, persona, username, config } = useVault();
  const ok = evidence.filter((e) => e.event === "DECRYPT_OK").length;
  const denied = evidence.filter((e) => e.event === "DECRYPT_DENIED").length;
  const gates = computeGates(evidence, blobs);
  return (
    <>
      <div className="cv-card cv-hero">
        <div>
          <div className="cv-row">
            <Pill tone="ok">TIDE THẬT</Pill>
            <span className="cv-mono cv-muted">realm {config.realm || "carevault"}</span>
          </div>
          <h1 className="cv-h1">Xin chào, {shortId(username)}</h1>
          <p className="cv-lede">Vai trò suy ra từ token: {persona}. Mọi số liệu dưới đây lấy từ kho blob và nhật ký bằng chứng thật.</p>
        </div>
        <div className="cv-actions">
          <button className="cv-btn cv-btn-primary" onClick={() => go("encrypt")}>Tạo và mã hóa hồ sơ mới</button>
          <button className="cv-btn" onClick={() => go("evidence")}>Xem bằng chứng</button>
        </div>
      </div>

      <div className="cv-grid-4">
        <Stat label="Hồ sơ trong kho" value={blobs.length} sub="chỉ ciphertext + sha256" />
        <Stat label="Giải mã thành công" value={ok} tone="ok" sub="từ nhật ký bằng chứng" />
        <Stat label="Bị Tide từ chối" value={denied} tone="bad" sub="từ nhật ký bằng chứng" />
        <Stat
          label="Ngưỡng ORK của realm"
          value={config.thresholdT && config.thresholdN ? `${config.thresholdT}/${config.thresholdN}` : "?"}
          sub="node Tide cần đồng ý"
        />
      </div>

      <div className="cv-split">
        <Card title="Hồ sơ gần đây" aside={<button className="cv-link" onClick={() => go("records")}>Xem tất cả</button>}>
          <RecordTable rows={blobs.slice(0, 5)} />
        </Card>
        <div className="cv-stack">
          <Card title="Phiên TideCloak">
            <dl className="cv-dl">
              <dt>Người dùng</dt>
              <dd className="cv-mono" title={username}>{shortId(username)}</dd>
              <dt>Role Tide</dt>
              <dd>{tideRoles.length ? tideRoles.map((r) => <code key={r} className="cv-code">{r}</code>) : <em>không có</em>}</dd>
              <dt>ORK</dt>
              <dd className="cv-mono">{config.homeOrkUrl || config.orkUrl || "?"}</dd>
            </dl>
          </Card>
          <Card title="Ba cổng kiểm chứng">
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
  if (status === "pass") return <Pill tone="ok">ĐÃ CÓ BẰNG CHỨNG</Pill>;
  if (status === "partial") return <Pill tone="warn">ĐANG LÀM</Pill>;
  return <Pill>CHƯA CHẠY</Pill>;
}

function RecordTable({ rows }) {
  const { decrypt, busy, results, username } = useVault();
  if (!rows.length) return <Empty>Chưa có hồ sơ nào. Vào “Mã hóa dữ liệu” để tạo hồ sơ đầu tiên.</Empty>;
  return (
    <div className="cv-table-wrap">
      <table className="cv-table">
        <thead>
          <tr>
            <th>Hồ sơ</th>
            <th>Blob và hash</th>
            <th>Chủ sở hữu</th>
            <th>Tạo lúc</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <React.Fragment key={b.id}>
              <tr>
                <td>
                  <strong>{b.label}</strong>
                  <div><Pill>{b.tag} · {TAG_LABELS[b.tag] || b.tag}</Pill></div>
                </td>
                <td className="cv-mono">
                  {b.id}
                  <div className="cv-muted">sha256 {b.sha256.slice(0, 12)}…</div>
                </td>
                <td className="cv-mono" title={b.owner}>{b.owner === username ? "tôi" : shortId(b.owner)}</td>
                <td>{formatTime(b.createdAt)}</td>
                <td className="cv-right">
                  <button className="cv-btn cv-btn-primary cv-btn-sm" onClick={() => decrypt(b)} disabled={busy === b.id}>
                    {busy === b.id ? "Đang hỏi mạng Tide…" : "Giải mã"}
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
  const [selected, setSelected] = useState(null);
  const blob = blobs.find((b) => b.id === selected) || blobs[0];
  const result = blob && results[blob.id];
  return (
    <>
      <PageHeader
        kicker="Kho hồ sơ · Tide thật"
        title="Hồ sơ mã hóa"
        actions={<button className="cv-btn" onClick={reload}>Tải lại</button>}
      >
        Máy chủ chỉ lưu ciphertext và mã băm. Bấm “Giải mã” để yêu cầu mạng Tide mở hồ sơ với tư cách người đang đăng nhập.
      </PageHeader>
      <Card title="Danh mục hồ sơ">
        <RecordTable rows={blobs} />
      </Card>
      {blob && (
        <Card
          title="So sánh hai góc nhìn"
          aside={
            <select className="cv-input cv-select-sm" value={blob.id} onChange={(e) => setSelected(e.target.value)} aria-label="Chọn hồ sơ">
              {blobs.map((b) => (
                <option key={b.id} value={b.id}>{b.id} · {b.label}</option>
              ))}
            </select>
          }
        >
          <div className="cv-grid-2">
            <div className="cv-panel">
              <div className="cv-label">Trình duyệt của bạn (sau khi giải mã)</div>
              {result ? <Result result={result} /> : <Empty>Chưa giải mã hồ sơ này trong phiên hiện tại.</Empty>}
            </div>
            <div className="cv-panel cv-panel-dark">
              <div className="cv-label cv-on-dark">Máy chủ lưu trữ thấy</div>
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

  const steps = ["Nhập nội dung", "Mã hóa qua mạng Tide", "Lưu ciphertext vào kho", "Thử giải mã lại"];
  return (
    <>
      <PageHeader kicker="Mã hóa dữ liệu · Tide thật" title="Mã hóa và lưu hồ sơ">
        Nội dung được mã hóa bằng doEncrypt ngay trên trình duyệt. Kho chỉ nhận ciphertext.
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
        <Card title="Trình duyệt của bạn (bản rõ)">
          <form onSubmit={submit} className="cv-form">
            <label className="cv-label">Loại hồ sơ (tag)</label>
            <div className="cv-segment">
              {Object.keys(TAG_LABELS).map((t) => (
                <button
                  type="button"
                  key={t}
                  className={tag === t ? "active" : ""}
                  onClick={() => {
                    setTag(t);
                    setTitle(SAMPLE_RECORDS[t].title);
                    setBody(SAMPLE_RECORDS[t].body);
                  }}
                >
                  {t} · {TAG_LABELS[t]}
                </button>
              ))}
            </div>
            <label className="cv-label" htmlFor="cv-title">Tiêu đề</label>
            <input id="cv-title" className="cv-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="cv-label" htmlFor="cv-body">Nội dung (giả lập)</label>
            <textarea id="cv-body" className="cv-input cv-mono" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="cv-note">Bản rõ chỉ nằm trong bộ nhớ trình duyệt. Máy chủ CareVault không nhận chuỗi này.</div>
            {!canEncrypt && (
              <div className="cv-banner cv-banner-warn">
                Token hiện tại không có role <code className="cv-code">_tide_{tag}.selfencrypt</code>. Tide sẽ từ chối mã hóa.
              </div>
            )}
            <button className="cv-btn cv-btn-primary cv-btn-block" type="submit" disabled={busy === "encrypt"}>
              {busy === "encrypt" ? "Đang mã hóa qua mạng Tide…" : `Mã hóa (tag ${tag}) và lưu vào kho`}
            </button>
          </form>
        </Card>
        <Card title="Máy chủ lưu trữ (chỉ ciphertext)">
          {!created ? (
            <Empty>Chưa có bản mã hóa trong phiên này.</Empty>
          ) : (
            <div className="cv-form">
              <div className="cv-banner cv-banner-ok">Đã lưu {created.id}</div>
              <span className="cv-label">SHA-256</span>
              <div className="cv-mono cv-break">{created.sha256}</div>
              <span className="cv-label">Ciphertext do Tide tạo</span>
              <Cipher text={created.ciphertext} n={360} />
              <div className="cv-row">
                <button className="cv-btn cv-btn-primary" onClick={() => decrypt(created)} disabled={busy === created.id}>
                  Giải mã để kiểm tra
                </button>
                <button className="cv-btn" onClick={() => go("records")}>Xem trong kho</button>
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
  const fallback = useLatestOwnBlob();
  const [selected, setSelected] = useState(null);
  const [fetched, setFetched] = useState(null);
  const blob = blobs.find((b) => b.id === selected) || fallback;

  async function fetchBlob() {
    const started = performance.now();
    const r = await fetch("/api/blobs");
    const list = await r.json();
    const found = list.find((b) => b.id === blob.id);
    setFetched({ status: r.status, bytes: found ? found.ciphertext.length : 0, ms: Math.round(performance.now() - started), sha256: found?.sha256 });
  }

  const result = blob && results[blob.id];
  return (
    <>
      <PageHeader kicker="Kiểm chứng truy cập · Tide thật" title="Tải được bản mã khác với đọc được dữ liệu">
        Đăng nhập bằng tài khoản agent hoặc sysadmin, tải cùng blob của chủ hồ sơ, rồi yêu cầu Tide giải mã.
      </PageHeader>
      <div className="cv-card cv-identity">
        <div>
          <div className="cv-label">Danh tính đang kiểm thử</div>
          <div className="cv-h2 cv-mono" title={username}>{shortId(username)}</div>
          <div>{persona}</div>
        </div>
        <div>
          <div className="cv-label">Role Tide trong token</div>
          <div>{tideRoles.length ? tideRoles.map((r) => <code key={r} className="cv-code">{r}</code>) : <em>không có</em>}</div>
        </div>
        <div>
          <div className="cv-label">Hồ sơ mục tiêu</div>
          {blobs.length ? (
            <select className="cv-input" value={blob?.id} onChange={(e) => { setSelected(e.target.value); setFetched(null); }} aria-label="Chọn hồ sơ">
              {blobs.map((b) => (
                <option key={b.id} value={b.id}>{b.id} · {b.label} · {shortId(b.owner)}</option>
              ))}
            </select>
          ) : (
            <em>chưa có blob</em>
          )}
        </div>
      </div>
      {blob && (
        <div className="cv-grid-2">
          <Card title="Giai đoạn 1 · Tải bản mã" aside={fetched && <Pill tone="ok">HTTP {fetched.status}</Pill>}>
            <dl className="cv-dl">
              <dt>Chủ sở hữu</dt>
              <dd className="cv-mono">{shortId(blob.owner)}{blob.owner === username ? " (là tôi)" : ""}</dd>
              <dt>Blob</dt>
              <dd className="cv-mono">{blob.id}</dd>
              <dt>Kích thước</dt>
              <dd className="cv-mono">{fetched ? `${fetched.bytes} ký tự · ${fetched.ms} ms` : "chưa tải"}</dd>
              <dt>SHA-256</dt>
              <dd className="cv-mono cv-break">{blob.sha256}</dd>
            </dl>
            <Cipher text={blob.ciphertext} n={240} />
            <button className="cv-btn" onClick={fetchBlob}>Tải ciphertext từ kho</button>
          </Card>
          <Card title="Giai đoạn 2 · Yêu cầu Tide giải mã" aside={result && <Pill tone={result.ok ? "ok" : "bad"}>{result.ok ? "THÀNH CÔNG" : "BỊ TỪ CHỐI"}</Pill>}>
            <p className="cv-muted">
              doDecrypt gửi yêu cầu tới mạng Tide với token hiện tại. Kết quả bên dưới là phản hồi thật, được ghi vào nhật ký bằng chứng.
            </p>
            <button className="cv-btn cv-btn-primary" onClick={() => decrypt(blob)} disabled={busy === blob.id}>
              {busy === blob.id ? "Đang hỏi mạng Tide…" : `doDecrypt với tư cách ${shortId(username)}`}
            </button>
            {result ? <Result result={result} /> : <Empty>Chưa thử giải mã.</Empty>}
          </Card>
        </div>
      )}
      <Card title="Cách đọc kết quả">
        <div className="cv-table-wrap">
          <table className="cv-table">
            <thead>
              <tr>
                <th>Tình huống</th>
                <th>Tải ciphertext</th>
                <th>Giải mã</th>
                <th>Ý nghĩa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Chủ hồ sơ</td>
                <td>Được</td>
                <td><Pill tone="ok">Được</Pill></td>
                <td>Dữ liệu là của chính người này.</td>
              </tr>
              <tr>
                <td>AI agent có role giải mã</td>
                <td>Được</td>
                <td><Pill tone="bad">Từ chối (kỳ vọng)</Pill></td>
                <td>Role selfdecrypt chỉ mở dữ liệu của chính mình.</td>
              </tr>
              <tr>
                <td>SysAdmin</td>
                <td>Được</td>
                <td><Pill tone="bad">Từ chối (kỳ vọng)</Pill></td>
                <td>Quyền quản trị không đồng nghĩa với quyền đọc.</td>
              </tr>
              <tr>
                <td>Lỗi mạng / cấu hình</td>
                <td>Có thể lỗi</td>
                <td><Pill tone="warn">Lỗi kỹ thuật</Pill></td>
                <td>Không phải bằng chứng bảo mật; đọc kỹ thông báo lỗi.</td>
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
  const [user, setUser] = useState("");
  const [role, setRole] = useState("_tide_cardio.selfdecrypt");
  const lastRefresh = evidence.find((e) => e.event === "TOKEN_REFRESHED" && e.actor === username);
  return (
    <>
      <PageHeader kicker="Quản trị IGA · Tide thật" title="Đổi quyền phải qua change request">
        Gán role không có hiệu lực ngay. TideCloak tạo một change request đang chờ, chỉ vào token sau khi được duyệt và lấy token mới.
      </PageHeader>
      <div className="cv-banner cv-banner-warn">
        Môi trường dev: ngưỡng duyệt là 1 quản trị viên (admin master của container). Triển khai thật cần nhiều người duyệt độc lập.
      </div>
      <div className="cv-grid-2">
        <Card title="1 · Yêu cầu gán role">
          <div className="cv-form">
            <label className="cv-label" htmlFor="cv-iga-user">Người dùng</label>
            <input id="cv-iga-user" className="cv-input cv-mono" value={user} placeholder={`mặc định: tôi (${shortId(username)})`} onChange={(e) => setUser(e.target.value)} />
            <label className="cv-label" htmlFor="cv-iga-role">Role</label>
            <select id="cv-iga-role" className="cv-input cv-mono" value={role} onChange={(e) => setRole(e.target.value)}>
              {["cardio", "psych"].flatMap((t) => [`_tide_${t}.selfdecrypt`, `_tide_${t}.selfencrypt`]).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button className="cv-btn cv-btn-primary" onClick={() => requestRole(user, role)}>Gửi yêu cầu</button>
          </div>
        </Card>
        <Card title="2 · Change request đang chờ" aside={<button className="cv-btn cv-btn-sm" onClick={loadPending}>Tải danh sách</button>}>
          {!pending && <Empty>Bấm “Tải danh sách” để xem.</Empty>}
          {Array.isArray(pending) && pending.length === 0 && <Empty>Không có change request nào đang chờ.</Empty>}
          {Array.isArray(pending) &&
            pending.map((cr) => (
              <div key={cr.id} className="cv-cr">
                <div>
                  <Pill tone="warn">ĐANG CHỜ</Pill> <span className="cv-mono">{cr.id}</span>
                  <div className="cv-mono cv-muted cv-break">{short(JSON.stringify(cr), 200)}</div>
                </div>
                <button className="cv-btn cv-btn-primary cv-btn-sm" onClick={() => approve(cr.id)}>Duyệt</button>
              </div>
            ))}
          {pending && !Array.isArray(pending) && <pre className="cv-pre">{JSON.stringify(pending, null, 2)}</pre>}
        </Card>
      </div>
      <Card title="3 · Lấy token mới và so sánh role" aside={<button className="cv-btn cv-btn-primary cv-btn-sm" onClick={refreshToken}>Lấy token mới</button>}>
        <div className="cv-grid-2">
          <div className="cv-panel cv-panel-dark">
            <div className="cv-label cv-on-dark">Token trước (lần làm mới gần nhất)</div>
            <pre className="cv-pre-dark">{JSON.stringify({ roles: lastRefresh ? lastRefresh.rolesBefore : "chưa làm mới" }, null, 2)}</pre>
          </div>
          <div className="cv-panel cv-panel-dark">
            <div className="cv-label cv-on-dark">Token hiện tại · iat {issuedAt ? new Date(issuedAt * 1000).toLocaleTimeString("vi-VN") : "?"}</div>
            <pre className="cv-pre-dark">{JSON.stringify({ sub: shortId(username), roles: tideRoles }, null, 2)}</pre>
          </div>
        </div>
        <p className="cv-muted">4 · Sau khi có role mới, vào “Kiểm chứng truy cập” và thử giải mã hồ sơ của Lan một lần nữa.</p>
      </Card>
    </>
  );
}

// ---------- evidence ----------

export function EvidencePage() {
  const { evidence, blobs, reload } = useVault();
  const [filter, setFilter] = useState("all");
  const gates = computeGates(evidence, blobs);
  const rows = evidence.filter((e) => filter === "all" || e.event === filter);
  const events = Array.from(new Set(evidence.map((e) => e.event)));

  function exportJson() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), gates, evidence }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "carevault-evidence.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <PageHeader
        kicker="Bằng chứng bảo mật"
        title="Bằng chứng từ nhật ký thật"
        actions={
          <>
            <button className="cv-btn" onClick={reload}>Tải lại</button>
            <button className="cv-btn cv-btn-primary" onClick={exportJson}>Xuất JSON</button>
          </>
        }
      >
        Trạng thái từng cổng được tính trực tiếp từ data/evidence.jsonl. Cổng nào chưa có sự kiện tương ứng sẽ ghi “Chưa chạy”.
      </PageHeader>
      <div className="cv-grid-3">
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
                <div className="cv-mono">{g.proof.event} · {formatTime(g.proof.at)}</div>
                <div className="cv-mono cv-muted">{shortId(g.proof.actor)} · {personaOf(g.proof.roles)}</div>
                {g.proof.error && <div className="cv-mono cv-text-bad cv-break">{short(g.proof.error, 120)}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      <Card
        title={`Nhật ký (${rows.length})`}
        aside={
          <select className="cv-input cv-select-sm" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Lọc sự kiện">
            <option value="all">Tất cả sự kiện</option>
            {events.map((ev) => (
              <option key={ev}>{ev}</option>
            ))}
          </select>
        }
      >
        {rows.length === 0 ? (
          <Empty>Chưa có sự kiện nào.</Empty>
        ) : (
          <div className="cv-table-wrap">
            <table className="cv-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Sự kiện</th>
                  <th>Danh tính</th>
                  <th>Đối tượng</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e, i) => (
                  <tr key={i}>
                    <td className="cv-mono">{formatTime(e.at)}</td>
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
        Nhật ký này do ứng dụng ghi trên máy chạy demo, không phải log bất biến độc lập. Nó cho thấy phản hồi thật của Tide ở mỗi lần thử.
      </div>
    </>
  );
}
