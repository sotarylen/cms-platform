'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

export interface DetailNavBarProps {
    /**
     * 自定义类名
     */
    className?: string;
    /**
     * 左侧返回按钮配置
     */
    backButton: {
        /** 返回链接 */
        href: string;
        /** 按钮文本 */
        label: string;
        /** 图标元素 */
        icon?: React.ReactNode;
    };

    /**
     * 右侧导航配置
     */
    navigation: {
        /** 上一项链接，null 表示禁用 */
        prevHref: string | null;
        /** 上一项按钮文本 */
        prevLabel: string;
        /** 列表链接 */
        listHref: string;
        /** 列表按钮文本 */
        listLabel: string;
        /** 列表图标元素 */
        listIcon?: React.ReactNode;
        /** 下一项链接，null 表示禁用 */
        nextHref: string | null;
        /** 下一项按钮文本 */
        nextLabel: string;
    };
}

export function DetailNavBar({ backButton, navigation, className }: DetailNavBarProps) {
    return (
        <Card className={cn("sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60", className)}>
            <CardContent className="flex items-center justify-between p-4 gap-4">
                {/* 左侧返回按钮 */}
                <Link href={backButton.href}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 hover:bg-muted"
                    >
                        {backButton.icon}
                        <span className="hidden sm:inline">{backButton.label}</span>
                    </Button>
                </Link>

                <Separator orientation="vertical" className="h-6 hidden md:block" />

                {/* 右侧导航按钮组 */}
                <div className="flex items-center gap-2">
                    {/* 上一项 */}
                    {navigation.prevHref ? (
                        <Link href={navigation.prevHref}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">{navigation.prevLabel}</span>
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">{navigation.prevLabel}</span>
                        </Button>
                    )}

                    {/* 列表 - 使用 default 变体突出显示 */}
                    <Link href={navigation.listHref}>
                        <Button
                            variant="default"
                            size="sm"
                            className="gap-2 shadow-sm"
                        >
                            {navigation.listIcon}
                            <span className="hidden sm:inline">{navigation.listLabel}</span>
                        </Button>
                    </Link>

                    {/* 下一项 */}
                    {navigation.nextHref ? (
                        <Link href={navigation.nextHref}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <span className="hidden sm:inline">{navigation.nextLabel}</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="gap-2"
                        >
                            <span className="hidden sm:inline">{navigation.nextLabel}</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
