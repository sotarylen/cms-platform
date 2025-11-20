import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookId } = body;
    if (!bookId) {
      return NextResponse.json({ error: 'missing bookId' }, { status: 400 });
    }

    const webhookUrl = process.env.N8N_TRIGGER_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'N8N_TRIGGER_URL not configured' },
        { status: 500 },
      );
    }

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: 'n8n returned error', detail: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
