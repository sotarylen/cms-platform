import { notFound } from 'next/navigation';
import { getModelById, getAlbumsByModel, getAdjacentModels } from '@/lib/data/model-queries';
import { ModelDetailClient } from '@/components/model-detail-client';

type PageProps = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string; pageSize?: string }>;
};

export default async function ModelDetailPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const modelId = Number(resolvedParams.id);
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 30;

    const model = await getModelById(modelId);

    if (!model) {
        notFound();
    }

    const { items: albums, total } = await getAlbumsByModel(modelId, { page, pageSize });
    const { prevId, nextId } = await getAdjacentModels(modelId);

    return (
        <ModelDetailClient
            model={model}
            albums={albums}
            total={total}
            page={page}
            pageSize={pageSize}
            prevId={prevId}
            nextId={nextId}
        />
    );
}
