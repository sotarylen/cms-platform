'use client';

import { useState, useRef } from 'react';
import type { AlbumStudio } from '@/lib/types';
import { EditDialog } from '@/components/forms/edit-dialog';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Image as ImageIcon } from "lucide-react"

type Props = {
    studio: AlbumStudio;
    onClose: () => void;
    onSuccess: () => void;
    open: boolean;
};

export function StudioEditModal({ studio, onClose, onSuccess, open }: Props) {
    const [name, setName] = useState(studio.studio_name || '');
    const [intro, setIntro] = useState(studio.studio_intro || '');
    const [coverUrl, setCoverUrl] = useState(studio.studio_cover_url || '');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(studio.studio_cover_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            let finalCoverUrl = coverUrl;

            // Upload file if selected
            if (coverFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('cover', coverFile);

                try {
                    const uploadRes = await fetch(`/api/studios/${studio.studio_id}/cover`, {
                        method: 'POST',
                        body: uploadFormData,
                    });

                    if (uploadRes.ok) {
                        const data = await uploadRes.json();
                        if (data.url) {
                            finalCoverUrl = data.url;
                        }
                    } else {
                        console.error('上传失败:', await uploadRes.text());
                        throw new Error('图片上传失败');
                    }
                } catch (uploadError) {
                    console.error('上传失败:', uploadError);
                    throw new Error('图片上传失败');
                }
            }

            // Update studio info
            const response = await fetch(`/api/studios/${studio.studio_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studio_name: name,
                    studio_intro: intro,
                    studio_cover_url: finalCoverUrl && finalCoverUrl.trim() !== '' ? finalCoverUrl : null,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || '更新失败');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message || '发生未知错误');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <EditDialog
            isOpen={open}
            onClose={onClose}
            title="编辑工作室信息"
            onSubmit={handleSubmit}
            loading={isSubmitting}
            error={error}
            maxWidth="sm:max-w-[800px]"
        >
            <div className="grid grid-cols-[240px_1fr] gap-6 py-4">
                {/* Left Column: Logo Preview */}
                <div className="space-y-4">
                    <Label>Logo 预览</Label>
                    <div className="aspect-square relative rounded-lg overflow-hidden border bg-muted shadow-sm group flex items-center justify-center">
                        {coverPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={coverPreview}
                                alt="Logo Preview"
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                                <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                                <span className="text-sm">暂无 Logo</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {coverFile ? '更换图片' : '上传 Logo'}
                        </Button>
                    </div>
                    {coverFile && (
                        <p className="text-xs text-muted-foreground text-center truncate px-2">
                            已选择: {coverFile.name}
                        </p>
                    )}
                </div>

                {/* Right Column: Form Fields */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="studio-name">工作室名称</Label>
                        <Input
                            id="studio-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="输入工作室名称"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="studio-intro">简介</Label>
                        <Textarea
                            id="studio-intro"
                            value={intro}
                            onChange={(e) => setIntro(e.target.value)}
                            rows={8}
                            placeholder="输入工作室简介..."
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="studio-cover">Logo URL (可选)</Label>
                        <Input
                            id="studio-cover"
                            type="text"
                            value={coverUrl}
                            onChange={(e) => {
                                setCoverUrl(e.target.value);
                                setCoverPreview(e.target.value);
                                setCoverFile(null);
                            }}
                            placeholder="https://example.com/logo.jpg"
                        />
                        <p className="text-xs text-muted-foreground">
                            如果上传了图片，此 URL 将被忽略。
                        </p>
                    </div>
                </div>
            </div>
        </EditDialog>
    );
}
