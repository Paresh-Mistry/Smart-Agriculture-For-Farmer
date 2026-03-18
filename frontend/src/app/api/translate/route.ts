// import { NextResponse } from 'next/server'

// export async function POST(req: Request) {
//   const { text, targetLang } = await req.json()

//   try {
//     const response = await fetch(
//       `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
//         text
//       )}&langpair=en|${targetLang}`
//     )
//     const data = await response.json()
//     const translated = data.responseData.translatedText

//     return NextResponse.json({ translated })
//   } catch (err) {
//     console.error(err)
//     return NextResponse.json({ translated: text }) // fallback
//   }
// }




import { NextResponse } from "next/server";

// Rate limiting map (IP -> { count, resetTime })
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(req: Request) {
  // Get IP for rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  try {
    const { text, targetLang } = await req.json();

    // Validation
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid text parameter" },
        { status: 400 }
      );
    }

    if (!targetLang || typeof targetLang !== "string") {
      return NextResponse.json(
        { error: "Invalid targetLang parameter" },
        { status: 400 }
      );
    }

    // Don't translate if target is English
    if (targetLang === "en") {
      return NextResponse.json({ translated: text });
    }

    // Call translation API
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=en|${targetLang}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const translated = data.responseData?.translatedText;

    if (!translated) {
      throw new Error("No translation returned");
    }

    return NextResponse.json({ translated });
  } catch (err) {
    console.error("Translation error:", err);
    const { text } = await req.json();
    // Return original text as fallback
    return NextResponse.json({ translated: text });
  }
}
