import { NextResponse } from "next/server";

interface AskRequest {
  traceName: string;
  severity: string;
  failureType: string;
  confidenceScore: number;
  description: string;
  question: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  let body: AskRequest;
  try {
    body = await req.json() as AskRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { traceName, severity, failureType, confidenceScore, description, question } = body;

  const systemPrompt = `You are an AI operations expert. Answer questions about failed AI traces in 1-2 short sentences maximum. Be direct and specific. No preamble, no markdown, no bullet points. Plain conversational text only.`;

  const userMessage = `Trace: ${traceName}
Severity: ${severity}
Failure type: ${failureType}
Confidence: ${confidenceScore}%
Description: ${description}

Question: ${question}`;

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (err) {
    console.error("[ask/route] fetch error:", err);
    return NextResponse.json({ error: "Failed to reach Anthropic API" }, { status: 500 });
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("[ask/route] Anthropic error:", res.status, text);
    return NextResponse.json({ error: `Anthropic API error: ${res.status}`, detail: text }, { status: 500 });
  }

  const claude = await res.json();
  console.log("[ask/route] response:", JSON.stringify(claude, null, 2));

  const answer: string = claude?.content?.[0]?.text ?? "";
  if (!answer) {
    console.error("[ask/route] unexpected response shape:", claude);
    return NextResponse.json({ error: "Empty response from Claude", raw: claude }, { status: 500 });
  }

  return NextResponse.json({ answer });
}
