import { NextRequest, NextResponse } from 'next/server';
const base = (process.env.ADMIN_API_BASE_URL || 'https://api.khodrochare.ir/api/v1').replace(/\/$/, '');
const cookieName = 'khodrochare_admin_session';
async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const route = path.join('/');
  if (!((route === 'session' && ['POST', 'DELETE'].includes(req.method)) || (route === 'overview' && req.method === 'GET'))) return NextResponse.json({ error: 'این مسیر در پنل مشاهده‌ای در دسترس نیست.' }, { status: 405 });
  if (req.method !== 'GET' && req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 403 });
  try {
    const token = req.cookies.get(cookieName)?.value;
    const upstream = await fetch(`${base}/admin/${route}`, { method: req.method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: req.method === 'POST' ? JSON.stringify(await req.json()) : undefined, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const data = upstream.status === 204 ? null : await upstream.json();
    const response = data === null ? new NextResponse(null, { status: upstream.status }) : NextResponse.json(req.method === 'POST' && upstream.ok ? { ok: true } : data, { status: upstream.status });
    response.headers.set('Cache-Control', 'no-store');
    if (req.method === 'POST' && upstream.ok) response.cookies.set(cookieName, data.token, { httpOnly: true, secure: req.nextUrl.protocol === 'https:', sameSite: 'strict', path: '/api/admin', maxAge: 28800 });
    if (req.method === 'DELETE' || upstream.status === 401) response.cookies.set(cookieName, '', { httpOnly: true, sameSite: 'strict', path: '/api/admin', maxAge: 0 });
    return response;
  } catch { return NextResponse.json({ error: 'ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.' }, { status: 503 }); }
}
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
