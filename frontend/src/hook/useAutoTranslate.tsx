"use client"
import { useEffect, useState } from "react"

const cache = new Map<string, string>()

export function useAutoTranslate(text: string, targetLang = 'hi') {
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    async function fetchTranslation() {
      const cacheKey = `${text}_${targetLang}`
      if (cache.has(cacheKey)) {
        setTranslated(cache.get(cacheKey)!)
        return
      }

      const res = await fetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify({ text, targetLang }),
      })
      const data = await res.json()
      cache.set(cacheKey, data.translated)
      setTranslated(data.translated)
    }

    fetchTranslation()
  }, [text, targetLang])

  return translated
}
