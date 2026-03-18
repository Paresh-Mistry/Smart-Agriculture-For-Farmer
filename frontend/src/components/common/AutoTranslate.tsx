"use client";

import { Children, cloneElement, isValidElement, ReactNode } from "react";
import { useLanguage } from "@component/hooks/translation/useLanguage";
import { useAutoTranslate } from "@component/hooks/translation/useAutoTranslate";

interface AutoTranslateProps {
  children: ReactNode;
  disabled?: boolean;
}

export function AutoTranslate({ children, disabled = false }: AutoTranslateProps) {
  const { language } = useLanguage();

  if (disabled || language === "en") {
    return <>{children}</>;
  }

  const translateNode = (node: ReactNode): ReactNode => {
    // Handle primitives
    if (typeof node === "string") {
      return <TranslateText text={node} targetLang={language} />;
    }

    if (typeof node === "number" || typeof node === "boolean" || node == null) {
      return node;
    }

    // Handle arrays
    if (Array.isArray(node)) {
      return node.map((child, idx) => (
        <span key={idx}>{translateNode(child)}</span>
      ));
    }

    // Handle React elements
    if (isValidElement(node)) {
      const children = (node.props as any)?.children;
      
      if (!children) {
        return node;
      }

      // Translate children
      const translatedChildren = Array.isArray(children)
        ? Children.map(children, translateNode)
        : translateNode(children);

      return cloneElement(node as any, {}, translatedChildren);
    }

    return node;
  };

  return <>{translateNode(children)}</>;
}

// Helper component for translating text
function TranslateText({ text, targetLang }: { text: string; targetLang: string }) {
  const { translated } = useAutoTranslate(text, targetLang);
  return <>{translated}</>;
}
