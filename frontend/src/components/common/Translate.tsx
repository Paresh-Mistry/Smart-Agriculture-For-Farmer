"use client";

import { useAutoTranslate } from "@component/hooks/translation/useAutoTranslate";
import { useLanguage } from "@component/hooks/translation/useLanguage";

interface TranslateProps {
  children: string;
  lang?: string;
  fallback?: string;
  showLoading?: boolean;
}

export default function Translate({ 
  children, 
  lang, 
  fallback,
  showLoading = false 
}: TranslateProps) {
  const { language } = useLanguage();
  const targetLang = lang || language;
  
  const { translated, isLoading, error } = useAutoTranslate(children, targetLang);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  if (isLoading && showLoading) {
    return <span className="opacity-50">{children}</span>;
  }

  return <>{translated}</>;
}