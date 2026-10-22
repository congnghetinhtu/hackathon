import React, { useEffect, useState } from "react";
import { VaultProvider, useVault, shortId } from "./vault.jsx";
import { LoginPage, OverviewPage, RecordsPage, EncryptPage, VerifyPage, IgaPage, EvidencePage, Pill } from "./pages.jsx";
import LegacyDemo from "./LegacyDemo.jsx";
import "./carevault.css";

const NAV = [
  { id: "overview", label: "Tổng quan" },
  { id: "records", label: "Hồ sơ mã hóa" },
  { id: "encrypt", label: "Mã hóa dữ liệu" },
  { id: "verify", label: "Kiểm chứng truy cập" },
  { id: "iga", label: "Quản trị IGA" },
  { id: "evidence", label: "Bằng chứng bảo mật" },
];

const PAGES = {
  overview: OverviewPage,
  records: RecordsPage,
  encrypt: EncryptPage,
  verify: VerifyPage,
  iga: IgaPage,
  evidence: EvidencePage,
  legacy: LegacyDemo,
};

function Shell() {
  const { authenticated, isInitializing, username, persona, logout } = useVault();
  const [page, setPage] = useState("overview");

  useEffect(() => {
    if (location.pathname === "/auth/redirect" && !isInitializing) {
      history.replaceState(null, "", "/");
    }
  }, [isInitializing]);

  if (isInitializing) return <div className="cv-loading">Đang kết nối TideCloak…</div>;
  if (!authenticated) return <LoginPage />;

  const Page = PAGES[page];
  const current = NAV.find((n) => n.id === page);
  return (
    <div className="cv-app">
      <aside className="cv-sidebar">
        <div className="cv-brand">
          <span className="cv-logo">CareVault</span>
          <Pill tone="ok">Built with TideCloak</Pill>
        </div>
        <nav className="cv-nav" aria-label="Điều hướng chính">
          {NAV.map((n) => (
            <button key={n.id} className={page === n.id ? "active" : ""} onClick={() => setPage(n.id)} aria-current={page === n.id ? "page" : undefined}>
              {n.label}
            </button>
          ))}
          <div className="cv-nav-group">Ý tưởng mở rộng</div>
          <button className={page === "legacy" ? "active" : ""} onClick={() => setPage("legacy")}>
            Chia sẻ cho bác sĩ <span className="cv-pill cv-pill-neutral">MÔ PHỎNG</span>
          </button>
        </nav>
        <div className="cv-sidebar-foot">
          <div className="cv-label">Realm</div>
          <div className="cv-mono">carevault · localhost:8080</div>
        </div>
      </aside>
      <div className="cv-main">
        <header className="cv-topbar">
          <div className="cv-crumbs">
            <span className="cv-muted">CareVault</span>
            <span className="cv-muted">/</span>
            <strong>{current ? current.label : "Chia sẻ cho bác sĩ (mô phỏng)"}</strong>
          </div>
          <div className="cv-user">
            <div>
              <div className="cv-mono" title={username}>{shortId(username)}</div>
              <div className="cv-small cv-text-primary">{persona}</div>
            </div>
            <button className="cv-btn cv-btn-sm" onClick={logout}>Đăng xuất</button>
          </div>
        </header>
        <main className="cv-content">
          {page === "legacy" && (
            <div className="cv-banner cv-banner-warn">
              Trang này là bản mô phỏng ý tưởng ban đầu, chạy bằng dữ liệu seed trong trình duyệt, không gọi Tide. Chia sẻ mã hóa cho bác sĩ
              cần policy Forseti của Tide, phần hướng dẫn tạo policy hiện chưa được phát hành.
            </div>
          )}
          <Page go={setPage} />
        </main>
      </div>
      <nav className="cv-bottomnav" aria-label="Điều hướng (di động)">
        {NAV.map((n) => (
          <button key={n.id} className={page === n.id ? "active" : ""} onClick={() => setPage(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <VaultProvider>
      <Shell />
    </VaultProvider>
  );
}
