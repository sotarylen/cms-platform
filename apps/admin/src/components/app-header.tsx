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
        <p className="app-eyebrow">n8n 数据浏览</p>
        <h1>{isHome ? '小说知识库' : '小说详情'}</h1>
        <p className="app-subtitle">
          搜索书籍、浏览章节、查看摘要与改编脚本
        </p>
      </div>
      <div className="app-badge">{isHome ? 'Beta' : '内测'}</div>
    </header>
  );
}

