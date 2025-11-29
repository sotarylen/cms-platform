'use client';

import { useState } from 'react';

type Props = {
    src: string | null;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
};

export function AlbumCover({ src, alt, className, style }: Props) {
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div className={`album-cover-placeholder ${className || ''}`} style={style}>
                <i className="fas fa-image"></i>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            onError={() => setError(true)}
        />
    );
}
