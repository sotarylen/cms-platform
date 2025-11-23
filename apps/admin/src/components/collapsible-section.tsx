'use client';

import { useState } from 'react';

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
    <section className="panel collapsible">
      <div className="collapsible-header">
        <button
          type="button"
          className="collapsible-trigger"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <div>
            <h3>{title}</h3>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          <span className="chevron" data-open={open}>
            <i className={`fas fa-chevron-${open ? 'up' : 'down'}`}></i>
          </span>
        </button>
        {actions && <div className="collapsible-actions">{actions}</div>}
      </div>
      {open && <div className="collapsible-content">{children}</div>}
    </section>
  );
}