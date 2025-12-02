'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SearchBar } from '@/components/search-bar';
import { ViewToggle } from '@/components/view-toggle';

export interface StandardContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    /**
     * 容器标题或左侧自定义内容
     */
    title?: React.ReactNode;
    /**
     * 左侧额外操作（紧跟在标题后面）
     */
    actionLeft?: React.ReactNode;
    /**
     * 搜索配置
     */
    search?: {
        value: string;
        onChange: (value: string) => void;
        onSearch: () => void;
        placeholder?: string;
    };
    /**
     * 视图切换配置
     */
    viewToggle?: {
        view: 'grid' | 'list';
        onViewChange: (view: 'grid' | 'list') => void;
    };
    /**
     * 右侧额外操作（在搜索框和视图切换之前或之后，视布局而定，这里放在最右侧）
     */
    actionsRight?: React.ReactNode;
    /**
     * 内容区域的类名
     */
    contentClassName?: string;
}

export function StandardContainer({
    title,
    actionLeft,
    search,
    viewToggle,
    actionsRight,
    children,
    className,
    contentClassName,
    ...props
}: StandardContainerProps) {
    return (
        <Card className={cn("overflow-hidden border-border/50 shadow-sm bg-background/60 backdrop-blur-md", className)} {...props}>
            {/* 容器头部 */}
            <div className="relative px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* 渐变背景 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/40 to-muted/20" />

                {/* 毛玻璃效果层 */}
                <div className="absolute inset-0 backdrop-blur-sm bg-background/40" />

                {/* 内容层 */}
                <div className="relative z-10 flex items-center gap-4 flex-1 min-w-0">
                    {typeof title === 'string' ? (
                        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                    ) : (
                        title
                    )}
                    {actionLeft}

                    {viewToggle && (
                        <ViewToggle
                            view={viewToggle.view}
                            onViewChange={viewToggle.onViewChange}
                        />
                    )}
                </div>

                {/* 右侧区域：搜索 + 右侧操作 */}
                <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
                    {search && (
                        <div className="w-full md:w-64">
                            <SearchBar
                                value={search.value}
                                onChange={search.onChange}
                                onSearch={search.onSearch}
                                placeholder={search.placeholder}
                            />
                        </div>
                    )}

                    {actionsRight}
                </div>
            </div>

            <Separator />

            {/* 内容区域 */}
            <div className={cn("p-6", contentClassName)}>
                {children}
            </div>
        </Card>
    );
}
