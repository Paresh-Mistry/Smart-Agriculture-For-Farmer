'use client'

import { useAutoTranslate } from "@component/hook/useAutoTranslate"

interface TranslateProps {
  children: string
  lang?: string
}

export default function Translate({ children, lang = 'mr' }: TranslateProps) {
  const translated = useAutoTranslate(children, lang)
  return <>{translated}</>
}
