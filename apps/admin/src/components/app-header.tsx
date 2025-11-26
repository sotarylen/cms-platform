'use client';

import Link from 'next/link';
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
      <div className="header-content">
        <h1 className="logo">
          Novel CMS Platform
        </h1>
      </div>
    </header>
  );
}

