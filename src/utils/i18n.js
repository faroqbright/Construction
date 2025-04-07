import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./Translation_PT_English.json";
import pt from "./Translation_PT_Portugal.json";

// Check if language is already saved in localStorage, else default to Portuguese
const savedLang = localStorage.getItem("i18nextLng") || "pt";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: savedLang, // use saved language or default to Portuguese
  fallbackLng: "pt",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
