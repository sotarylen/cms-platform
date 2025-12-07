'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Upload, Image as ImageIcon } from 'lucide-react';
import { EditDialog } from '@/components/forms/edit-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateModelAction } from '@/app/actions/models';
import type { AlbumModel } from '@/lib/types';

type Props = {
    model: AlbumModel;
    onSuccess?: () => void;
};

export function ModelEditDialog({ model, onSuccess }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        model_name: model.model_name,
        model_alias: model.model_alias || '',
        model_intro: model.model_intro || '',
        model_cover_url: model.model_cover_url || ''
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(model.model_cover_url || null);
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
        setError(null);
        setLoading(true);

        try {
            if (!formData.model_name.trim()) {
                setError('模特名称不能为空');
                setLoading(false);
                return;
            }

            let finalCoverUrl = formData.model_cover_url;

            // Upload file if selected
            if (coverFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('cover', coverFile);

                try {
                    const uploadRes = await fetch(`/api/models/${model.model_id}/cover`, {
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

            const result = await updateModelAction(model.model_id, {
                ...formData,
                model_cover_url: finalCoverUrl && finalCoverUrl.trim() !== '' ? finalCoverUrl : undefined
            });

            if (result.success) {
                toast.success('模特信息更新成功');
                setIsOpen(false);
                if (onSuccess) {
                    onSuccess();
                } else {
                    window.location.reload();
                }
            } else {
                setError(result.error || '更新失败');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                size="sm"
            >
                <Edit className="mr-2 h-4 w-4" />
                编辑模特
            </Button>

            <EditDialog
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setError(null);
                    setFormData({
                        model_name: model.model_name,
                        model_alias: model.model_alias || '',
                        model_intro: model.model_intro || '',
                        model_cover_url: model.model_cover_url || ''
                    });
                    setCoverFile(null);
                    setCoverPreview(model.model_cover_url || null);
                }}
                title="编辑模特"
                description="修改模特信息"
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                maxWidth="sm:max-w-[800px]"
            >
                <div className="grid grid-cols-[240px_1fr] gap-6 py-4">
                    {/* Left Column: Cover Preview */}
                    <div className="space-y-4">
                        <Label>封面预览</Label>
                        <div className="aspect-square relative rounded-lg overflow-hidden border bg-muted shadow-sm group flex items-center justify-center">
                            {coverPreview ? (
                                <img
                                    src={coverPreview}
                                    alt="Cover Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                                    <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                                    <span className="text-sm">暂无封面</span>
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
                                {coverFile ? '更换图片' : '上传封面'}
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
                            <Label htmlFor="edit-model-name">模特名称 *</Label>
                            <Input
                                id="edit-model-name"
                                value={formData.model_name}
                                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                                placeholder="请输入模特名称"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-model-alias">模特别名</Label>
                            <Input
                                id="edit-model-alias"
                                value={formData.model_alias}
                                onChange={(e) => setFormData({ ...formData, model_alias: e.target.value })}
                                placeholder="请输入模特别名（可选）"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-model-intro">模特介绍</Label>
                            <Textarea
                                id="edit-model-intro"
                                value={formData.model_intro}
                                onChange={(e) => setFormData({ ...formData, model_intro: e.target.value })}
                                placeholder="请输入模特介绍（可选）"
                                rows={6}
                                className="resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-model-cover">封面 URL (可选)</Label>
                            <Input
                                id="edit-model-cover"
                                value={formData.model_cover_url}
                                onChange={(e) => {
                                    setFormData({ ...formData, model_cover_url: e.target.value });
                                    setCoverPreview(e.target.value);
                                    setCoverFile(null);
                                }}
                                placeholder="https://example.com/cover.jpg"
                            />
                            <p className="text-xs text-muted-foreground">
                                如果上传了图片，此 URL 将被忽略。
                            </p>
                        </div>
                    </div>
                </div>
            </EditDialog>
        </>
    );
}
