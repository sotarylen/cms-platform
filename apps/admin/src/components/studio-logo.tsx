'use client';

import { Building2 } from 'lucide-react';
import { useState } from 'react';

interface StudioLogoProps {
    coverUrl: string | null;
    studioName: string;
    size?: 'sm' | 'lg';
}

export function StudioLogo({ coverUrl, studioName, size = 'sm' }: StudioLogoProps) {
    const [imageError, setImageError] = useState(false);

    const isValidUrl = coverUrl && coverUrl !== '0' && (coverUrl.startsWith('http') || coverUrl.startsWith('/'));
    const sizeClasses = size === 'sm' ? 'h-12 w-12' : 'h-32 w-32';
    const iconSize = size === 'sm' ? 'h-6 w-6' : 'h-12 w-12';
    const borderClass = size === 'lg' ? 'border-4 border-background shadow-sm' : '';

    return (
        <div className={`${sizeClasses} rounded-full bg-muted flex items-center justify-center overflow-hidden ${borderClass} flex-shrink-0`}>
            {isValidUrl && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={coverUrl}
                    alt={studioName}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <Building2 className={`${iconSize} text-muted-foreground`} />
            )}
        </div>
    );
}
