import { Badge } from '@/components/ui/badge';
import { getStatusMeta } from '@/lib/utils';

import { cn } from '@/lib/utils';

type Props = {
  status: number | null;
  className?: string;
};

export function StatusPill({ status, className }: Props) {
  const meta = getStatusMeta(status);

  const variantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    'neutral': 'secondary',
    'warning': 'outline',
    'success': 'default',
    'error': 'destructive',
  };

  return (
    <Badge variant={variantMap[meta.tone] || 'secondary'} className={cn(className)}>
      {meta.label}
    </Badge>
  );
}
