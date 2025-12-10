import { notFound } from 'next/navigation';
import { getModelById, getAlbumsByModel, getAdjacentModels } from '@/lib/data/model-queries';
import { ModelDetailClient } from '@/components/model-detail-client';

type PageProps = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string; pageSize?: string; sort?: string; view?: string; query?: string }>;
};

export default async function ModelDetailPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const modelId = Number(resolvedParams.id);
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 30;
    const sort = (resolvedSearchParams.sort as 'newest' | 'oldest' | 'updated' | 'title' | 'id_asc' | 'id_desc') || 'newest';
    const view = (resolvedSearchParams.view as 'grid' | 'list') || 'grid';
    const query = resolvedSearchParams.query || '';

    const model = await getModelById(modelId);

    if (!model) {
        notFound();
    }

    const { items: albums, total } = await getAlbumsByModel(modelId, { page, pageSize, sort, query });
    const { prevId, nextId } = await getAdjacentModels(modelId);

    return (
        <ModelDetailClient
            model={model}
            albums={albums}
            total={total}
            page={page}
            pageSize={pageSize}
            sort={sort}
            viewMode={view}
            searchQuery={query}
            prevId={prevId}
            nextId={nextId}
        />
    );
}
