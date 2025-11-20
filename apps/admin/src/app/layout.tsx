import type { Metadata } from 'next';
import '@/app/globals.css';
import { AppHeader } from '@/components/app-header';

export const metadata: Metadata = {
  title: '小说资料面板',
  description: '以更友好的方式浏览 n8n 数据库中的小说内容',
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="app-shell">
          <AppHeader />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}

