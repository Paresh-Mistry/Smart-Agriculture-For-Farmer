import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { text, targetLang } = await req.json()

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=en|${targetLang}`
    )
    const data = await response.json()
    const translated = data.responseData.translatedText

    return NextResponse.json({ translated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ translated: text }) // fallback
  }
}
