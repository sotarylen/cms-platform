import { getStatusMeta } from '@/lib/utils';

type Props = {
  status: number | null;
};

export function StatusPill({ status }: Props) {
  const meta = getStatusMeta(status);
  return (
    <span className="status-pill" data-tone={meta.tone}>
      {meta.label}
    </span>
  );
}

