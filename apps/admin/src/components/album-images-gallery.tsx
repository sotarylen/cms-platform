'use client';

import { useState, useEffect } from 'react';
import { ImageLightbox } from './image-lightbox';
import { setAlbumCover, deleteAlbumImage } from '@/app/actions/albums';
import { toast } from 'sonner';
import { Pagination } from './navigation/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
    albumId: number;
    images: string[];
    storagePath: string;
    total: number;
    page: number;
    pageSize: number;
};

export function AlbumImagesGallery({ albumId, images, storagePath, total, page, pageSize }: Props) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [columns, setColumns] = useState(2);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Responsive column calculation
    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width >= 1280) setColumns(5);      // xl
            else if (width >= 1024) setColumns(4); // lg
            else if (width >= 768) setColumns(3);  // md
            else setColumns(2);                    // default
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
        setLightboxOpen(true);
    };

    const handleSetCover = async (index: number) => {
        const filename = images[index];
        const coverUrl = `/api/images/albums/${albumId}/${filename}`;

        const result = await setAlbumCover(albumId, coverUrl);
        if (result.success) {
            toast.success('设置封面成功！');
        } else {
            toast.error('设置封面失败');
        }
    };

    const handleDelete = async (index: number) => {
        const filename = images[index];

        const result = await deleteAlbumImage(albumId, filename);
        if (result.success) {
            toast.success('图片已删除');
            setLightboxOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || '删除失败');
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('pageSize', newPageSize.toString());
        params.set('page', '1'); // Reset to first page when page size changes
        router.push(`?${params.toString()}`);
    };

    if (images.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">暂无图片</div>;
    }

    // Distribute images into columns for masonry layout
    const columnImages: string[][] = Array.from({ length: columns }, () => []);
    const imageIndices: number[][] = Array.from({ length: columns }, () => []); // Track original indices

    images.forEach((image, index) => {
        const colIndex = index % columns;
        columnImages[colIndex].push(image);
        imageIndices[colIndex].push(index);
    });

    // Construct full URLs for the lightbox
    const imageUrls = images.map(filename => `/api/images/albums/${albumId}/${filename}`);

    return (
        <>
            <div className="flex gap-4 items-start mb-6">
                {columnImages.map((colImages, colIndex) => (
                    <div key={colIndex} className="flex-1 flex flex-col gap-4">
                        {colImages.map((filename, i) => {
                            const originalIndex = imageIndices[colIndex][i];
                            const imagePath = `/api/images/albums/${albumId}/${filename}`;
                            return (
                                <div
                                    key={originalIndex}
                                    className="relative group cursor-zoom-in rounded-lg overflow-hidden bg-muted"
                                    onClick={() => handleImageClick(originalIndex)}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imagePath}
                                        alt={`Image ${originalIndex + 1}`}
                                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {total > 0 && (
                <Pagination
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[20, 50, 100]}
                    showTotal={true}
                    showJumpTo={true}
                />
            )}

            {lightboxOpen && (
                <ImageLightbox
                    images={imageUrls}
                    initialIndex={selectedImageIndex}
                    onClose={() => setLightboxOpen(false)}
                    onSetCover={handleSetCover}
                    onDelete={handleDelete}
                    albumId={albumId}
                    imageFilenames={images}
                />
            )}
        </>
    );
}
