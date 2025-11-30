'use client';

import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/pagination';

interface AlbumListPaginationProps {
    total: number;
    page: number;
    pageSize: number;
    view: string;
}

export function AlbumListPagination({ total, page, pageSize, view }: AlbumListPaginationProps) {
    const router = useRouter();

    const handlePageChange = (newPage: number) => {
        router.push(`/albums/list?view=${view}&page=${newPage}&pageSize=${pageSize}`);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        router.push(`/albums/list?view=${view}&page=1&pageSize=${newPageSize}`);
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
