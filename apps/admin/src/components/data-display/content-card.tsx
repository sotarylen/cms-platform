'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlbumCover } from '@/components/album-cover';

export interface ContentCardProps {
    /**
     * 标题
     */
    title: string;

    /**
     * 图片地址
     */
    image: string | null;

    /**
     * 链接目标
     */
    href: string;

    /**
     * 副标题或元数据
     */
    subtitle?: React.ReactNode;

    /**
     * 图片比例
     * @default 'portrait'
     */
    aspectRatio?: 'portrait' | 'square' | 'video';

    /**
     * 图片上的覆盖内容（如徽章、操作按钮）
     */
    overlay?: React.ReactNode;

    /**
     * 底部额外内容
     */
    footer?: React.ReactNode;

    /**
     * 自定义类名
     */
    className?: string;

    /**
     * 图片自定义类名
     */
    imageClassName?: string;
}

const aspectRatioMap = {
    portrait: 'aspect-[2/3]',
    square: 'aspect-square',
    video: 'aspect-video',
};

export function ContentCard({
    title,
    image,
    href,
    subtitle,
    aspectRatio = 'portrait',
    overlay,
    footer,
    className,
    imageClassName,
}: ContentCardProps) {
    return (
        <Link
            href={href}
            className={cn('group block space-y-3', className)}
        >
            <div className={cn(
                'relative overflow-hidden rounded-md border bg-muted',
                aspectRatioMap[aspectRatio]
            )}>
                <AlbumCover
                    src={image}
                    alt={title}
                    className={cn(
                        'h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
                        imageClassName
                    )}
                />

                {/* Overlay */}
                {overlay && (
                    <div className="absolute inset-0 p-2">
                        {overlay}
                    </div>
                )}
            </div>

            <div className="space-y-1.5 text-sm">
                <h3 className={cn(
                    "font-medium leading-none truncate transition-colors group-hover:text-primary",
                    !subtitle && "py-1" // Add padding if no subtitle for better alignment
                )} title={title}>
                    {title}
                </h3>

                {subtitle && (
                    <div className="text-muted-foreground text-xs line-clamp-2">
                        {subtitle}
                    </div>
                )}

                {footer && (
                    <div className="pt-1">
                        {footer}
                    </div>
                )}
            </div>
        </Link>
    );
}
