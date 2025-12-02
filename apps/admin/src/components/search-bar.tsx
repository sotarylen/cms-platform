'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    placeholder?: string;
    className?: string;
}

export function SearchBar({
    value,
    onChange,
    onSearch,
    placeholder = "搜索...",
    className
}: SearchBarProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className={cn("relative flex items-center", className)}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-9 pr-12"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={onSearch}
            >
                搜索
            </Button>
        </div>
    );
}
