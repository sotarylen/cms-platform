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
          <Link href="/">CMS 管理平台</Link>
        </h1>
        <nav className="main-nav">
          <ul>
            <li>
              <Link href="/books" className={pathname === '/books' ? 'active' : ''}>
                书籍管理
              </Link>
            </li>
            <li>
              <Link href="/users" className={pathname === '/users' ? 'active' : ''}>
                用户管理
              </Link>
            </li>
            <li>
              <Link href="/sources" className={pathname === '/sources' ? 'active' : ''}>
                来源管理
              </Link>
            </li>
            <li>
              <Link href="/n8n" className={pathname === '/n8n' ? 'active' : ''}>
                n8n接口
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

