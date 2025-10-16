import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export const POST = async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "Falta OPENAI_API_KEY en el entorno" },
        { status: 500 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Debes enviar 'messages' (formato chat)" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.4,
    });

    const reply = completion.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error("/api/chat error", err);
    return NextResponse.json(
      { ok: false, error: "Error interno en el chat" },
      { status: 500 }
    );
  }
};

