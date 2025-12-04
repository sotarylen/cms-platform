'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Play } from "lucide-react";

type Props = {
    albumId: number;
    videos: string[];
};

function VideoItem({
    albumId,
    video,
    isPlaying,
    onPlay
}: {
    albumId: number;
    video: string;
    isPlaying: boolean;
    onPlay: () => void;
}) {
    if (isPlaying) {
        return (
            <div className="space-y-2">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden border">
                    <video
                        controls
                        autoPlay
                        className="w-full h-full"
                        src={`/api/images/albums/${albumId}/${video}`}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="text-xs text-muted-foreground truncate px-1" title={video}>
                    {video}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div
                className="relative aspect-video bg-muted rounded-lg overflow-hidden border cursor-pointer group flex items-center justify-center hover:bg-muted/80 transition-colors"
                onClick={onPlay}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`/api/video-thumbnail?id=${albumId}&filename=${encodeURIComponent(video)}`}
                    alt={video}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="h-12 w-12 rounded-full bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="h-6 w-6 fill-foreground ml-1" />
                    </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black/60 p-1 rounded backdrop-blur-sm truncate z-10">
                    {video}
                </div>
            </div>
        </div>
    );
}

export function AlbumVideoGallery({ albumId, videos }: Props) {
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);

    if (videos.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    视频内容 ({videos.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video, index) => (
                        <VideoItem
                            key={index}
                            albumId={albumId}
                            video={video}
                            isPlaying={playingIndex === index}
                            onPlay={() => setPlayingIndex(index)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
