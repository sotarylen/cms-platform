'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface Breadcrumb {
    label: string;
    href?: string;
}

export interface PageHeaderProps {
    /**
     * 页面标题（必需）
     */
    title: string;

    /**
     * 副标题/描述（可选）
     */
    subtitle?: string;

    /**
     * 右侧操作区域（可选）
     */
    actions?: React.ReactNode;

    /**
     * 显示返回按钮（可选）
     */
    backButton?: boolean;

    /**
     * 返回按钮的目标路径（可选）
     * 如果不提供，将使用 router.back()
     */
    backHref?: string;

    /**
     * 面包屑导航（可选，预留未来扩展）
     */
    breadcrumbs?: Breadcrumb[];

    /**
     * 自定义类名（可选）
     */
    className?: string;

    /**
     * 标题标签类型（可选）
     * @default 'h1'
     */
    as?: 'h1' | 'h2' | 'h3';
}

/**
 * PageHeader 组件
 * 
 * 标准化的页面标题组件，用于所有页面顶部
 * 
 * @example
 * ```tsx
 * // 基础使用
 * <PageHeader title="仪表盘" subtitle="欢迎回来！这里是系统概览。" />
 * 
 * // 带操作按钮
 * <PageHeader 
 *   title="书籍管理" 
 *   subtitle="管理和查看所有书籍"
 *   actions={<Button>添加书籍</Button>}
 * />
 * 
 * // 带返回按钮
 * <PageHeader 
 *   title="书籍详情" 
 *   backButton 
 * />
 * ```
 */
export function PageHeader({
    title,
    subtitle,
    actions,
    backButton = false,
    backHref,
    breadcrumbs,
    className,
    as: Component = 'h1',
}: PageHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (backHref) {
            router.push(backHref);
        } else {
            router.back();
        }
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* 面包屑导航（预留） */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <span>/</span>}
                            {crumb.href ? (
                                <a href={crumb.href} className="hover:text-foreground">
                                    {crumb.label}
                                </a>
                            ) : (
                                <span>{crumb.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* 主标题区域 */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* 返回按钮 */}
                    {backButton && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="mt-1 shrink-0"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}

                    {/* 标题和副标题 */}
                    <div className="flex-1 min-w-0">
                        <Component className="text-3xl font-bold tracking-tight">
                            {title}
                        </Component>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground mt-2">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* 操作按钮区域 */}
                {actions && (
                    <div className="shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
