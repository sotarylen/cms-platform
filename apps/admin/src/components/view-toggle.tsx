'use client';

import * as React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ViewToggleProps {
    view: 'grid' | 'list';
    onViewChange: (view: 'grid' | 'list') => void;
    className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
    return (
        <div className={cn("flex items-center border rounded-md bg-background p-1", className)}>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "h-7 w-7 p-0 rounded-sm hover:bg-muted",
                    view === 'grid' && "bg-muted text-foreground shadow-sm"
                )}
                onClick={() => onViewChange('grid')}
                title="网格视图"
            >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">网格视图</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "h-7 w-7 p-0 rounded-sm hover:bg-muted",
                    view === 'list' && "bg-muted text-foreground shadow-sm"
                )}
                onClick={() => onViewChange('list')}
                title="列表视图"
            >
                <List className="h-4 w-4" />
                <span className="sr-only">列表视图</span>
            </Button>
        </div>
    );
}
