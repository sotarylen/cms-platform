'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/pagination';

interface StudiosPaginationProps {
    total: number;
    page: number;
    pageSize: number;
    view: string;
}

export function StudiosPagination({ total, page, pageSize, view }: StudiosPaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get('search') || '';

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams();
        params.set('view', view);
        params.set('page', newPage.toString());
        params.set('pageSize', pageSize.toString());
        if (search) params.set('search', search);
        router.push(`/albums/studios?${params.toString()}`);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        const params = new URLSearchParams();
        params.set('view', view);
        params.set('page', '1');
        params.set('pageSize', newPageSize.toString());
        if (search) params.set('search', search);
        router.push(`/albums/studios?${params.toString()}`);
    };

    return (
        <Pagination
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
        />
    );
}
