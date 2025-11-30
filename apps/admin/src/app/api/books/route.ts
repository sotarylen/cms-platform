import { NextResponse } from 'next/server';
import { getBooks } from '@/lib/data/books';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tab = url.searchParams.get('tab') || 'in-stock';
    const search = url.searchParams.get('query') || undefined;
    const source = url.searchParams.get('source') || undefined;
    const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;
    const pageSize = url.searchParams.get('pageSize') ? Number(url.searchParams.get('pageSize')) : undefined;

    const opts: any = {
      search,
      source,
      page,
      pageSize,
      // default ordering (can be overridden per-tab)
      order: 'created_at_desc',
    };

    if (tab === 'in-stock') {
      opts.minChapters = 1;
      // in-stock should be ordered by id DESC
      opts.order = 'id_desc';
    } else if (tab === 'pending') {
      opts.status = '0';
      opts.maxChapters = 0;
      // pending (待获取) ordered by id ASC
      opts.order = 'id_asc';
    }

    const data = await getBooks(opts);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
