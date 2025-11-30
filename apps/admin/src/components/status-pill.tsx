import { Badge } from '@/components/ui/badge';
import { getStatusMeta } from '@/lib/utils';

type Props = {
  status: number | null;
};

export function StatusPill({ status }: Props) {
  const meta = getStatusMeta(status);

  const variantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    'neutral': 'secondary',
    'warning': 'outline',
    'success': 'default',
    'error': 'destructive',
  };

  return (
    <Badge variant={variantMap[meta.tone] || 'secondary'}>
      {meta.label}
    </Badge>
  );
}
