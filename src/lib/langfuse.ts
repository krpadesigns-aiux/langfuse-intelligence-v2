// Server-only — requires LANGFUSE_PUBLIC_KEY (or NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY)
// and LANGFUSE_SECRET_KEY env vars

const BASE_URL =
  process.env.LANGFUSE_BASE_URL ??
  process.env.NEXT_PUBLIC_LANGFUSE_HOST ??
  'https://cloud.langfuse.com';

function authHeader(): string {
  const pub =
    process.env.LANGFUSE_PUBLIC_KEY ??
    process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY;
  const secret = process.env.LANGFUSE_SECRET_KEY;
  if (!pub || !secret) {
    throw new Error(
      'Missing Langfuse credentials. Set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY.',
    );
  }
  return 'Basic ' + Buffer.from(`${pub}:${secret}`).toString('base64');
}

// ---- Types ----------------------------------------------------------------

export interface Score {
  id: string;
  traceId: string;
  name: string;
  value: number;
  dataType?: string;
}

export interface Trace {
  id: string;
  timestamp: string;
  name: string | null;
  userId: string | null;
  sessionId: string | null;
  release: string | null;
  version: string | null;
  projectId: string;
  input: unknown;
  output: unknown;
  metadata: unknown;
  tags: string[];
  latency?: number;
  scores?: Score[];
}

export interface TracesResponse {
  data: Trace[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface GetTracesParams {
  page?: number;
  limit?: number;
  userId?: string;
  sessionId?: string;
  name?: string;
  tags?: string[];
}

export interface CreateScoreBody {
  traceId: string;
  name: string;
  value: number;
  observationId?: string;
  comment?: string;
}

export interface CreateScoreResponse {
  id: string;
}

// ---- Fetch wrappers -------------------------------------------------------

export async function getTraces(params: GetTracesParams = {}): Promise<TracesResponse> {
  const qs = new URLSearchParams();
  if (params.page != null)    qs.set('page', String(params.page));
  if (params.limit != null)   qs.set('limit', String(params.limit));
  if (params.userId)          qs.set('userId', params.userId);
  if (params.sessionId)       qs.set('sessionId', params.sessionId);
  if (params.name)            qs.set('name', params.name);
  params.tags?.forEach((t) => qs.append('tags', t));

  const query = qs.toString();
  const url = `${BASE_URL}/api/public/traces${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`getTraces failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<TracesResponse>;
}


export interface Observation {
  id: string;
  name: string | null;
  startTime: string;
  endTime: string | null;
  level: 'DEFAULT' | 'DEBUG' | 'WARNING' | 'ERROR';
}

export interface TraceDetailResponse {
  id: string;
  observations: Observation[];
}

export async function getTraceById(id: string): Promise<TraceDetailResponse> {
  const res = await fetch(`${BASE_URL}/api/public/traces/${id}`, {
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`getTraceById failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<TraceDetailResponse>;
}

export async function createScore(body: CreateScoreBody): Promise<CreateScoreResponse> {
  const res = await fetch(`${BASE_URL}/api/public/scores`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`createScore failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<CreateScoreResponse>;
}
