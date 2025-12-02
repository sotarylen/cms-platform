'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

export interface ViewToggleProps {
    /**
     * 当前视图模式
     */
    view: ViewMode;

    /**
     * 视图切换回调
     */
    onViewChange: (view: ViewMode) => void;

    /**
     * 按钮尺寸（可选）
     * @default 'icon'
     */
    size?: 'sm' | 'default' | 'lg' | 'icon';

    /**
     * 样式变体（可选）
     * @default 'default'
     */
    variant?: 'default' | 'compact';

    /**
     * 自定义类名（可选）
     */
    className?: string;

    /**
     * Grid 模式的提示文本（可选）
     * @default '网格视图'
     */
    gridLabel?: string;

    /**
     * List 模式的提示文本（可选）
     * @default '列表视图'
     */
    listLabel?: string;
}

/**
 * ViewToggle 组件
 * 
 * 用于在网格视图和列表视图之间切换
 * 
 * @example
 * ```tsx
 * // 基础使用
 * <ViewToggle view={view} onViewChange={setView} />
 * 
 * // 自定义标签
 * <ViewToggle 
 *   view={view} 
 *   onViewChange={setView}
 *   gridLabel="卡片"
 *   listLabel="表格"
 * />
 * 
 * // 紧凑模式
 * <ViewToggle 
 *   view={view} 
 *   onViewChange={setView}
 *   variant="compact"
 *   size="sm"
 * />
 * ```
 */
export function ViewToggle({
    view,
    onViewChange,
    size = 'icon',
    variant = 'default',
    className,
    gridLabel = '网格视图',
    listLabel = '列表视图',
}: ViewToggleProps) {
    if (variant === 'compact') {
        // 紧凑模式：组合在一起的切换按钮
        return (
            <div className={cn('inline-flex rounded-md border p-1', className)}>
                <Button
                    variant={view === 'list' ? 'default' : 'ghost'}
                    size={size}
                    onClick={() => onViewChange('list')}
                    title={listLabel}
                    className="h-7 w-7"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant={view === 'grid' ? 'default' : 'ghost'}
                    size={size}
                    onClick={() => onViewChange('grid')}
                    title={gridLabel}
                    className="h-7 w-7"
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    // 默认模式：独立的按钮
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size={size}
                onClick={() => onViewChange('list')}
                title={listLabel}
                type="button"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size={size}
                onClick={() => onViewChange('grid')}
                title={gridLabel}
                type="button"
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
        </div>
    );
}
