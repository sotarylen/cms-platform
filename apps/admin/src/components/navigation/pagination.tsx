'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
    /**
     * 总条目数
     */
    total: number;

    /**
     * 当前页码（从 1 开始）
     */
    page: number;

    /**
     * 每页显示数量
     */
    pageSize: number;

    /**
     * 页码变化回调
     */
    onPageChange: (page: number) => void;

    /**
     * 每页数量变化回调（可选）
     */
    onPageSizeChange?: (pageSize: number) => void;

    /**
     * 每页数量选项（可选）
     * @default [10, 20, 30, 50, 100]
     */
    pageSizeOptions?: number[];

    /**
     * 显示总数（可选）
     * @default true
     */
    showTotal?: boolean;

    /**
     * 显示跳转（可选）
     * @default true
     */
    showJumpTo?: boolean;

    /**
     * 紧凑模式（可选）
     * 紧凑模式下隐藏部分功能
     * @default false
     */
    compact?: boolean;

    /**
     * 自定义类名（可选）
     */
    className?: string;
}

/**
 * Pagination 组件
 * 
 * 统一的分页组件，支持页码切换、每页数量调整、跳转等功能
 * 
 * @example
 * ```tsx
 * // 基础使用
 * <Pagination 
 *   total={100} 
 *   page={1} 
 *   pageSize={10}
 *   onPageChange={setPage}
 * />
 * 
 * // 带页面大小调整
 * <Pagination 
 *   total={100} 
 *   page={1} 
 *   pageSize={10}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 *   pageSizeOptions={[12, 24, 36]}
 * />
 * 
 * // 紧凑模式
 * <Pagination 
 *   total={100} 
 *   page={1} 
 *   pageSize={10}
 *   onPageChange={setPage}
 *   compact
 * />
 * ```
 */
export function Pagination({
    total,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 30, 50, 100],
    showTotal = true,
    showJumpTo = true,
    compact = false,
    className,
}: PaginationProps) {
    const [jumpPage, setJumpPage] = React.useState(page.toString());
    const totalPages = Math.ceil(total / pageSize);

    // 同步外部 page 变化
    React.useEffect(() => {
        setJumpPage(page.toString());
    }, [page]);

    const handleJump = (e: React.FormEvent) => {
        e.preventDefault();
        const p = parseInt(jumpPage);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
            onPageChange(p);
        } else {
            setJumpPage(page.toString());
        }
    };

    const handlePrevious = () => {
        if (page > 1) {
            onPageChange(page - 1);
        }
    };

    const handleNext = () => {
        if (page < totalPages) {
            onPageChange(page + 1);
        }
    };

    if (compact) {
        // 紧凑模式：只显示页码导航
        return (
            <div className={cn('flex items-center justify-center space-x-2', className)}>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1}
                    onClick={handlePrevious}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
                    {page} / {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages}
                    onClick={handleNext}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    // 完整模式
    return (
        <div className={cn('flex items-center justify-between px-2', className)}>
            {/* 总数显示 */}
            {showTotal && (
                <div className="text-sm text-muted-foreground">
                    共 {total.toLocaleString()} 条
                </div>
            )}

            <div className="flex items-center space-x-4">
                {/* 每页数量选择 */}
                {onPageSizeChange && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">每页</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => onPageSizeChange(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">条</span>
                    </div>
                )}

                {/* 页码导航 */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={page <= 1}
                        onClick={handlePrevious}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={page >= totalPages}
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* 跳转功能 */}
                {showJumpTo && (
                    <form onSubmit={handleJump} className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">跳至</span>
                        <Input
                            className="h-8 w-[50px] text-center"
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground">页</span>
                    </form>
                )}
            </div>
        </div>
    );
}
