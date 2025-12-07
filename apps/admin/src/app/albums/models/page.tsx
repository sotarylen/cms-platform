import { getModels } from '@/lib/data/albums';
import { ModelsClient } from '@/components/models-client';

export const dynamic = 'force-dynamic';

export default async function ModelList({ searchParams }: any) {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const view = (resolvedSearchParams.view as 'grid' | 'list') || 'grid';
    const pageSize = Number(resolvedSearchParams.pageSize) || 30;
    const search = resolvedSearchParams.search || '';

    const models = await getModels();

    return (
        <ModelsClient
            models={models}
            page={page}
            pageSize={pageSize}
            view={view}
            search={search}
        />
    );
}
