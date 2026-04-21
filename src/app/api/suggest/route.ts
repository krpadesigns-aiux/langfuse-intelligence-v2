import { NextResponse } from "next/server";

interface SuggestRequest {
  traceName: string;
  severity: string;
  failureType: string;
  confidenceScore: number;
  description: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  const body = (await req.json()) as SuggestRequest;
  const { traceName, severity, failureType, confidenceScore, description } = body;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system:
        'You are an AI operations expert reviewing failed AI pipeline traces. Suggest 3-4 specific actionable fixes. Each action max 8 words. Return valid JSON only: { "actions": string[], "reasoning": string }',
      messages: [
        {
          role: "user",
          content: `Trace: ${traceName}, Severity: ${severity}, Failure: ${failureType}, Confidence: ${confidenceScore}%, Description: ${description}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Claude API error: ${res.status} ${text}` }, { status: 500 });
  }

  const claude = await res.json();
  const raw: string = claude.content?.[0]?.text ?? "{}";

  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned) as { actions: string[]; reasoning: string };
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse Claude response", raw }, { status: 500 });
  }
}
