// "use client"
// import { useEffect, useState } from "react"

// const cache = new Map<string, string>()

// export function useAutoTranslate(text: string, targetLang = 'hi') {
//   const [translated, setTranslated] = useState(text)

//   useEffect(() => {
//     async function fetchTranslation() {
//       const cacheKey = `${text}_${targetLang}`
//       if (cache.has(cacheKey)) {
//         setTranslated(cache.get(cacheKey)!)
//         return
//       }

//       const res = await fetch('/api/translate', {
//         method: 'POST',
//         body: JSON.stringify({ text, targetLang }),
//       })
//       const data = await res.json()
//       cache.set(cacheKey, data.translated)
//       setTranslated(data.translated)
//     }

//     fetchTranslation()
//   }, [text, targetLang])

//   return translated
// }


"use client";

import { useEffect, useState } from "react";

// In-memory cache for translations
const cache = new Map<string, string>();

// LocalStorage cache key
const CACHE_KEY = "translation_cache";

// Load cache from localStorage on initialization
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([key, value]) => {
        cache.set(key, value as string);
      });
    }
  } catch (e) {
    console.error("Failed to load translation cache:", e);
  }
}

// Save cache to localStorage periodically
function saveCache() {
  if (typeof window !== "undefined") {
    try {
      const obj: Record<string, string> = {};
      cache.forEach((value, key) => {
        obj[key] = value;
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error("Failed to save translation cache:", e);
    }
  }
}

export function useAutoTranslate(text: string, targetLang = "en") {
  const [translated, setTranslated] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't translate empty strings or if target is same as source
    if (!text || !text.trim() || targetLang === "en") {
      setTranslated(text);
      return;
    }

    async function fetchTranslation() {
      const cacheKey = `${text}_${targetLang}`;

      // Check cache first
      if (cache.has(cacheKey)) {
        setTranslated(cache.get(cacheKey)!);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, targetLang }),
        });

        if (!res.ok) {
          throw new Error(`Translation failed: ${res.statusText}`);
        }

        const data = await res.json();

        
        // Store in cache
        cache.set(cacheKey, data.translated);
        setTranslated(data.translated);

        // Save cache to localStorage (debounced)
        saveCache();
      } catch (err) {
        console.error("Translation error:", err);
        setError(err instanceof Error ? err.message : "Translation failed");
        // Fallback to original text
        setTranslated(text);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTranslation();
  }, [text, targetLang]);

  return { translated, isLoading, error };
}
