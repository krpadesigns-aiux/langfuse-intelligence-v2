import { NextResponse } from 'next/server';
import { createScore } from '@/lib/langfuse';

export async function POST(req: Request) {
  try {
    const { traceId, value } = (await req.json()) as { traceId: string; value: number };
    if (!traceId || typeof value !== 'number') {
      return NextResponse.json({ error: 'Missing traceId or value' }, { status: 400 });
    }
    await createScore({ traceId, name: 'user-feedback', value });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
