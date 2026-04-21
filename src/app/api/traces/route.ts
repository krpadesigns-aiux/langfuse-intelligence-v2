import { NextResponse } from 'next/server';
import { getTraces } from '@/lib/langfuse';

export async function GET() {
  try {
    const data = await getTraces({ limit: 50 });

    // Debug: log first 3 traces to see actual field structure from Langfuse
    const sample = data.data.slice(0, 3).map((t) => ({
      id: t.id,
      name: t.name,
      tags: t.tags,
      scores: t.scores,
      metadataKeys: t.metadata ? Object.keys(t.metadata as object) : [],
    }));
    console.log('[traces/route] sample traces:', JSON.stringify(sample, null, 2));

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
