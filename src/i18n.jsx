import React, { createContext, useContext, useState } from "react";

// Two-language UI. Strings are written inline as t("tiếng Việt", "English") so
// both versions sit next to each other in the source.

const LangContext = createContext({ lang: "vi", setLang() {}, t: (vi) => vi });

function readStoredLang() {
  try {
    return localStorage.getItem("cv-lang") === "en" ? "en" : "vi";
  } catch {
    return "vi";
  }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang);
  function setLang(next) {
    setLangState(next);
    try {
      localStorage.setItem("cv-lang", next);
    } catch {
      // Preference only; ignore storage failures.
    }
    document.documentElement.lang = next;
  }
  const t = (vi, en) => (lang === "en" ? en : vi);
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="cv-lang" role="group" aria-label="Language / Ngôn ngữ">
      <button className={lang === "vi" ? "active" : ""} onClick={() => setLang("vi")} aria-pressed={lang === "vi"}>VI</button>
      <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
    </div>
  );
}
