export const formatNumber = (value: number) => {
  // Always format as a full, localized number (no "万" shorthand)
  return Intl.NumberFormat('zh-CN').format(value);
};

export const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
  }).format(date instanceof Date ? date : new Date(date));

export const statusMeta: Record<
  string,
  { label: string; tone: 'default' | 'warning' | 'danger' }
> = {
  '0': { label: '待处理', tone: 'warning' },
  '1': { label: '已处理', tone: 'default' },
  '2': { label: '处理中', tone: 'warning' },
  '3': { label: '异常', tone: 'danger' },
};

export const getStatusMeta = (status: number | null) => {
  if (status == null) {
    return { label: '未标记', tone: 'default' as const };
  }
  return statusMeta[String(status)] ?? {
    label: `状态 ${status}`,
    tone: 'default' as const,
  };
};

