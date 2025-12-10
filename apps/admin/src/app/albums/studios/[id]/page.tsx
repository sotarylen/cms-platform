import { notFound } from 'next/navigation';
import { getStudioById, getAlbumsByStudio, getAdjacentStudios } from '@/lib/data/albums';
import { StudioDetailClient } from '@/components/studio-detail-client';

type PageProps = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string; pageSize?: string; sort?: string; view?: string; query?: string }>;
};

export default async function StudioDetailPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const studioId = Number(resolvedParams.id);
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 30;
    const sort = (resolvedSearchParams.sort as 'newest' | 'oldest' | 'updated' | 'title' | 'id_asc' | 'id_desc') || 'newest';
    const view = (resolvedSearchParams.view as 'grid' | 'list') || 'grid';
    const query = resolvedSearchParams.query || '';

    const studio = await getStudioById(studioId);

    if (!studio) {
        notFound();
    }

    const { items: albums, total } = await getAlbumsByStudio(studioId, { page, pageSize, sort, query });
    const { prevId, nextId } = await getAdjacentStudios(studioId);

    return (
        <StudioDetailClient
            studio={studio}
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
