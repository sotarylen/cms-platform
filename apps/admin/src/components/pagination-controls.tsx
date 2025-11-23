import Link from 'next/link';

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  total: number;
  page: number;
  pageSize: number;
  pathname: string;
  searchParams?: SearchParams;
  pageParam?: string;
};

const buildPageItems = (totalPages: number, currentPage: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: 'page' as const,
      value: index + 1,
    }));
  }

  const pagesToInclude = new Set<number>([
    1,
    2,
    totalPages - 1,
    totalPages,
  ]);

  for (let offset = -1; offset <= 1; offset += 1) {
    const page = currentPage + offset;
    if (page > 2 && page < totalPages - 1) {
      pagesToInclude.add(page);
    }
  }

  const sorted = Array.from(pagesToInclude)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items: Array<{ type: 'page'; value: number } | { type: 'ellipsis' }> =
    [];

  let previous = 0;
  sorted.forEach((page) => {
    if (page - previous > 1) {
      items.push({ type: 'ellipsis' });
    }
    items.push({ type: 'page', value: page });
    previous = page;
  });

  return items;
};

export function PaginationControls({
  total,
  page,
  pageSize,
  pathname,
  searchParams = {},
  pageParam = 'page',
}: Props) {
  // 将searchParams转换为普通对象，避免直接使用awaited对象
  const resolvedSearchParams = { ...searchParams };
  
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildLink = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (key === pageParam) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value != null) {
        params.set(key, String(value));
      }
    });
    params.set(pageParam, String(targetPage));
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  };

  const pageItems = buildPageItems(totalPages, page);

  return (
    <div className="chapter-pagination">
      <Link
        className="page-link"
        href={buildLink(Math.max(1, page - 1)) as any}
        aria-disabled={page <= 1}
      >
        <i className="fas fa-chevron-left"></i>
      </Link>
      {pageItems.map((item, index) =>
        item.type === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="page-link" aria-disabled="true">
            …
          </span>
        ) : (
          <Link
            key={item.value}
            className="page-link"
            href={buildLink(item.value) as any}
            data-active={item.value === page}
          >
            {item.value}
          </Link>
        ),
      )}
      <Link
        className="page-link"
        href={buildLink(Math.min(totalPages, page + 1)) as any}
        aria-disabled={page >= totalPages}
      >
        <i className="fas fa-chevron-right"></i>
      </Link>
    </div>
  );
}

