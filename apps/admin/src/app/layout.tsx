import type { Metadata } from 'next';
import './globals.css';
import { AppSidebar } from '@/components/app-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { getSession } from '@/lib/session';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'CMS Admin',
  description: 'Content Management System Admin Panel',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
        <ThemeProvider defaultTheme="light" storageKey="cms-theme">
          <div className="flex h-screen overflow-hidden">
            <AppSidebar className="hidden md:flex flex-shrink-0" user={user} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <ScrollArea className="flex-1">
                <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                  {children}
                </main>
              </ScrollArea>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
