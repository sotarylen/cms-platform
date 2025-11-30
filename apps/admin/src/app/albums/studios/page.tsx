import { getStudios } from '@/lib/data/albums';
import { StudiosClient } from '@/components/studios-client';

export const dynamic = 'force-dynamic';

export default async function StudioList({ searchParams }: any) {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const view = (resolvedSearchParams.view as 'grid' | 'list') || 'grid';
    const pageSize = Number(resolvedSearchParams.pageSize) || 30;
    const search = resolvedSearchParams.search || '';

    const studios = await getStudios();

    return (
        <StudiosClient
            studios={studios}
            page={page}
            pageSize={pageSize}
            view={view}
            search={search}
        />
    );
}
