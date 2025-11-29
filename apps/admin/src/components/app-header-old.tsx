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
          <Link href="/">Novel CMS Platform</Link>
        </h1>
        <nav className="header-nav">
          <Link href="/" className={clsx('nav-link', { active: pathname === '/' })}>
            小说管理
          </Link>
          <Link href="/albums" className={clsx('nav-link', { active: pathname?.startsWith('/albums') })}>
            图集管理
          </Link>
        </nav>
      </div>
    </header>
  );
}

