export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_BACKEND_API_URL = 'http://localhost:3001/api';

function resolveBackendApiUrl() {
  return (process.env.BACKEND_API_URL || DEFAULT_BACKEND_API_URL).replace(/\/$/, '');
}

async function proxyToBackend(request, context) {
  const { path = [] } = await context.params;
  const segments = Array.isArray(path) ? path : [path];
  const targetPath = segments.filter(Boolean).join('/');
  const targetUrl = `${resolveBackendApiUrl()}/${targetPath}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
    init.duplex = 'half';
  }

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('transfer-encoding');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
