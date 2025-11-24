'use client';

import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function AppHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isChapterReader =
    pathname?.startsWith('/books/') && pathname.includes('/chapters/');

  if (isChapterReader) {
    return null;
  }

  return (
    <header
      className={clsx('app-header', {
        'app-header--compact': !isHome,
      })}
    >
      <div>
        <p className="app-eyebrow">n8n Novel Database</p>
        <h1>{isHome ? 'NOVEL' : 'NOVEL DETIAL'}</h1>
        <p className="app-subtitle">
          Search, Preview, and Adapt Scripts for Novels
        </p>
      </div>
      <div className="app-badge">{isHome ? 'Beta' : 'Beta'}</div>
    </header>
  );
}

