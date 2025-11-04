import { NextRequest, NextResponse } from 'next/server';

const LLM_URL = "http://localhost:11434/api/generate";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const ollamaResponse = await fetch(LLM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "smollm:360m" , 
                prompt,
                stream: false,
            }),
        });

        const data = await ollamaResponse.json();

        return NextResponse.json({ response: data.response });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}