'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    src: string | null;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    priority?: boolean; // 是否优先加载（首屏图片）
};

export function AlbumCover({ src, alt, className, style, priority = false }: Props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Treat empty string, null, '0', or error as invalid
    const isInvalidSrc = error || !src || src.trim() === '' || src === '0';

    if (isInvalidSrc) {
        return (
            <div
                className={cn(
                    "album-cover-placeholder bg-muted flex items-center justify-center",
                    className
                )}
                style={style}
            >
                <svg
                    className="w-12 h-12 text-muted-foreground/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", className)} style={style}>
            {/* Skeleton loader */}
            {loading && (
                <div className="absolute inset-0 bg-muted animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
                </div>
            )}

            {/* Actual image */}
            <img
                src={src}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    loading ? "opacity-0" : "opacity-100"
                )}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                onLoad={() => setLoading(false)}
                onError={() => {
                    setError(true);
                    setLoading(false);
                }}
            />
        </div>
    );
}
