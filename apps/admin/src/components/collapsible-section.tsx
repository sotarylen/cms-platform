'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  actions,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex-1 flex items-center justify-between text-left"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
          >
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {open ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {actions && <div className="ml-4">{actions}</div>}
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}