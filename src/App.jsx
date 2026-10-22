import React, { useEffect, useState } from "react";
import { VaultProvider, useVault, shortId } from "./vault.jsx";
import { LangProvider, LangToggle, useLang } from "./i18n.jsx";
import { LoginPage, OverviewPage, RecordsPage, EncryptPage, VerifyPage, IgaPage, EvidencePage, Pill } from "./pages.jsx";
import LegacyDemo from "./LegacyDemo.jsx";
import "./carevault.css";

const NAV = [
  { id: "overview", label: ["Tổng quan", "Overview"] },
  { id: "records", label: ["Hồ sơ mã hóa", "Encrypted records"] },
  { id: "encrypt", label: ["Mã hóa dữ liệu", "Encrypt data"] },
  { id: "verify", label: ["Kiểm chứng truy cập", "Verify access"] },
  { id: "iga", label: ["Quản trị IGA", "IGA governance"] },
  { id: "evidence", label: ["Bằng chứng bảo mật", "Security evidence"] },
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
  const { t } = useLang();
  const [page, setPage] = useState("overview");

  useEffect(() => {
    if (location.pathname === "/auth/redirect" && !isInitializing) {
      history.replaceState(null, "", "/");
    }
  }, [isInitializing]);

  if (isInitializing) return <div className="cv-loading">{t("Đang kết nối TideCloak…", "Connecting to TideCloak…")}</div>;
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
        <nav className="cv-nav" aria-label={t("Điều hướng chính", "Main navigation")}>
          {NAV.map((n) => (
            <button key={n.id} className={page === n.id ? "active" : ""} onClick={() => setPage(n.id)} aria-current={page === n.id ? "page" : undefined}>
              {t(...n.label)}
            </button>
          ))}
          <div className="cv-nav-group">{t("Ý tưởng mở rộng", "Future idea")}</div>
          <button className={page === "legacy" ? "active" : ""} onClick={() => setPage("legacy")}>
            {t("Chia sẻ cho bác sĩ", "Share with clinician")} <span className="cv-pill cv-pill-neutral">{t("MÔ PHỎNG", "SIMULATED")}</span>
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
            <strong>{current ? t(...current.label) : t("Chia sẻ cho bác sĩ (mô phỏng)", "Share with clinician (simulated)")}</strong>
          </div>
          <div className="cv-user">
            <LangToggle />
            <div>
              <div className="cv-mono" title={username}>{shortId(username)}</div>
              <div className="cv-small cv-text-primary">{persona}</div>
            </div>
            <button className="cv-btn cv-btn-sm" onClick={logout}>{t("Đăng xuất", "Sign out")}</button>
          </div>
        </header>
        <main className="cv-content">
          {page === "legacy" && (
            <div className="cv-banner cv-banner-warn">
              {t(
                "Trang này là bản mô phỏng ý tưởng ban đầu, chạy bằng dữ liệu seed trong trình duyệt, không gọi Tide. Chia sẻ mã hóa cho bác sĩ cần policy Forseti của Tide, phần hướng dẫn tạo policy hiện chưa được phát hành. Nội dung trang chỉ có tiếng Việt.",
                "This page is a simulation of the original idea. It runs on seed data in the browser and does not call Tide. Encrypted sharing with clinicians needs a Tide Forseti policy, whose creation guide has not been published yet. This page is in Vietnamese only."
              )}
            </div>
          )}
          <Page go={setPage} />
        </main>
      </div>
      <nav className="cv-bottomnav" aria-label={t("Điều hướng (di động)", "Navigation (mobile)")}>
        {NAV.map((n) => (
          <button key={n.id} className={page === n.id ? "active" : ""} onClick={() => setPage(n.id)}>
            {t(...n.label)}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <VaultProvider>
        <Shell />
      </VaultProvider>
    </LangProvider>
  );
}
