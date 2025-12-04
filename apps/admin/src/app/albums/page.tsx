import { getAlbumStats, getAlbums, getModels, getStudios } from '@/lib/data/albums';
import { AlbumsClient } from '@/components/albums-client';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

const normalizeParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

export default async function AlbumsDashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const resolvedSearchParams = await searchParams;
    const pageParam = normalizeParam(resolvedSearchParams.page);
    const pageSizeParam = normalizeParam(resolvedSearchParams.pageSize);
    const sortParam = normalizeParam(resolvedSearchParams.sort) as 'newest' | 'oldest' | 'updated' | undefined;
    const viewModeParam = normalizeParam(resolvedSearchParams.view) as 'grid' | 'list' | undefined;
    const searchQuery = normalizeParam(resolvedSearchParams.query) ?? '';
    const page = pageParam ? Number(pageParam) : 1;
    const pageSize = pageSizeParam ? Number(pageSizeParam) : 12;
    const sort = sortParam ?? 'newest';
    const viewMode = viewModeParam ?? 'grid';

    const stats = await getAlbumStats();
    const albumsData = await getAlbums({ page, pageSize, sort, query: searchQuery });
    const models = await getModels();
    const studios = await getStudios();

    return <AlbumsClient
        stats={stats}
        albumsData={albumsData}
        searchQuery={searchQuery}
        sort={sort}
        viewMode={viewMode}
        models={models}
        studios={studios}
    />;
}
