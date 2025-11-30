import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(date: Date | string | number): string {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);
}

export function getStatusMeta(status: number | null): { label: string; tone: 'neutral' | 'warning' | 'success' | 'error' } {
  switch (status) {
    case 0:
      return { label: '待处理', tone: 'neutral' };
    case 1:
      return { label: '进行中', tone: 'warning' };
    case 2:
      return { label: '已完成', tone: 'success' };
    case 3:
      return { label: '失败', tone: 'error' };
    default:
      return { label: '未知', tone: 'neutral' };
  }
}
