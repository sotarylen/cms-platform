'use client';

import { useState, useEffect } from 'react';
import { ImageLightbox } from './image-lightbox';
import { setAlbumCover } from '@/app/actions/albums';

type Props = {
    albumId: number;
    images: string[];
    storagePath: string;
};

export function AlbumImagesGallery({ albumId, images, storagePath }: Props) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [columns, setColumns] = useState(4);

    const handleSetCover = async (index: number) => {
        const filename = images[index];
        const coverUrl = `/api/images/albums/${albumId}/${filename}`;

        if (confirm('确定要将这张图片设为封面吗？')) {
            const result = await setAlbumCover(albumId, coverUrl);
            if (result.success) {
                // Optional: Show success message
            } else {
                alert('设置封面失败');
            }
        }
    };

    // 响应式列数
    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width < 600) setColumns(2);
            else if (width < 900) setColumns(3);
            else if (width < 1200) setColumns(4);
            else setColumns(5);
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // 将图片分配到各列
    const columnImages = Array.from({ length: columns }, () => [] as typeof images);
    images.forEach((image, index) => {
        columnImages[index % columns].push(image);
    });

    if (images.length === 0) {
        // ... (placeholder logic)
    }

    return (
        <>
            <div className="album-images-masonry" style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                {columnImages.map((colImages, colIndex) => (
                    <div key={colIndex} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {colImages.map((filename, index) => {
                            // 计算原始索引以保持正确的点击行为
                            // 原始索引 = (index * columns) + colIndex
                            // 注意：这假设是完全填充的，但实际上是按顺序分配的，所以这公式是对的
                            // 比如 4列:
                            // Col 0: 0, 4, 8
                            // Col 1: 1, 5, 9
                            // Col 2: 2, 6, 10
                            // Col 3: 3, 7, 11
                            // 所以 index=1 (第二行) colIndex=2 (第三列) => 1*4 + 2 = 6. 正确。
                            const originalIndex = (index * columns) + colIndex;

                            // 边界检查：如果计算出的索引超出了图片总数（虽然理论上不应该发生，但为了安全）
                            if (originalIndex >= images.length) return null;

                            const imagePath = `/api/images/albums/${albumId}/${filename}`;
                            return (
                                <div
                                    key={originalIndex}
                                    className="album-image-item"
                                    onClick={() => setSelectedImageIndex(originalIndex)}
                                    style={{ marginBottom: 0 }} // 覆盖 CSS 中的 margin
                                >
                                    <img
                                        src={imagePath}
                                        alt={`图片 ${originalIndex + 1}`}
                                        loading="lazy"
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                    />
                                    <div className="album-image-overlay">
                                        <span>{originalIndex + 1}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {selectedImageIndex !== null && (
                <ImageLightbox
                    images={images.map(filename => `/api/images/albums/${albumId}/${filename}`)}
                    initialIndex={selectedImageIndex}
                    onClose={() => setSelectedImageIndex(null)}
                    onSetCover={handleSetCover}
                />
            )}
        </>
    );
}
