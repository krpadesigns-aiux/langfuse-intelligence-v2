import { NextResponse } from 'next/server';
import { getTraceById } from '@/lib/langfuse';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const detail = await getTraceById(id);
    const steps = (detail.observations ?? []).map((obs) => ({
      name: obs.name ?? 'Unknown step',
      latency: obs.endTime
        ? Math.round(
            new Date(obs.endTime).getTime() - new Date(obs.startTime).getTime(),
          )
        : 0,
      status:
        obs.level === 'ERROR'
          ? 'failed'
          : obs.level === 'WARNING'
            ? 'warning'
            : 'ok',
    }));
    return NextResponse.json({ steps });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
