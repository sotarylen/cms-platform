import { notFound } from 'next/navigation';
import { getStudioById, getAlbumsByStudio } from '@/lib/queries';
import { StudioDetailClient } from '@/components/studio-detail-client';

type PageProps = {
    params: { id: string };
};

export default async function StudioDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const studioId = Number(resolvedParams.id);

    const studio = await getStudioById(studioId);

    if (!studio) {
        notFound();
    }

    const albums = await getAlbumsByStudio(studioId);

    return <StudioDetailClient studio={studio} albums={albums} />;
}
