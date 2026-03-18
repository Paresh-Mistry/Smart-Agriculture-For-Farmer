"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@component/hooks/translation/useLanguage";

export function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLang = availableLanguages.find(
    (lang) => lang.code === language
  );

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full 
                   bg-white/80 dark:bg-gray-900/80 
                   border border-gray-200 dark:border-gray-700
                   hover:bg-gray-100 dark:hover:bg-gray-800
                   transition shadow-sm"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="text-sm font-semibold uppercase">
          {currentLang?.code}
        </span>
        <ChevronDown
          size={16}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-36 rounded-xl 
                     bg-white dark:bg-gray-900 
                     border border-gray-200 dark:border-gray-700
                     shadow-lg overflow-hidden z-50"
        >
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2 text-sm
                hover:bg-gray-100 dark:hover:bg-gray-800 transition
                ${
                  language === lang.code
                    ? "bg-blue-50 dark:bg-blue-900/30 font-semibold"
                    : ""
                }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
