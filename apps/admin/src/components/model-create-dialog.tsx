'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { EditDialog } from '@/components/forms/edit-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createModelAction } from '@/app/actions/models';

export function ModelCreateDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        model_name: '',
        model_alias: '',
        model_intro: '',
        model_cover_url: ''
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
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

            const result = await createModelAction(formData);

            if (result.success && result.modelId) {
                // Upload cover if file selected
                if (coverFile) {
                    const uploadFormData = new FormData();
                    uploadFormData.append('cover', coverFile);

                    try {
                        await fetch(`/api/models/${result.modelId}/cover`, {
                            method: 'POST',
                            body: uploadFormData,
                        });
                    } catch (uploadError) {
                        console.error('封面上传失败:', uploadError);
                        // Continue even if upload fails
                    }
                }

                toast.success('模特创建成功');
                setIsOpen(false);
                setFormData({
                    model_name: '',
                    model_alias: '',
                    model_intro: '',
                    model_cover_url: ''
                });
                setCoverFile(null);
                setCoverPreview(null);
                window.location.reload();
            } else {
                setError(result.error || '创建失败');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '创建失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                size="icon"
                className="h-8 w-8"
            >
                <PlusCircle className="h-4 w-4" />
            </Button>

            <EditDialog
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setError(null);
                    setFormData({
                        model_name: '',
                        model_alias: '',
                        model_intro: '',
                        model_cover_url: ''
                    });
                    setCoverFile(null);
                    setCoverPreview(null);
                }}
                title="添加模特"
                description="创建新的模特记录"
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
                            <Label htmlFor="model-name">模特名称 *</Label>
                            <Input
                                id="model-name"
                                value={formData.model_name}
                                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                                placeholder="请输入模特名称"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model-alias">模特别名</Label>
                            <Input
                                id="model-alias"
                                value={formData.model_alias}
                                onChange={(e) => setFormData({ ...formData, model_alias: e.target.value })}
                                placeholder="请输入模特别名（可选）"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model-intro">模特介绍</Label>
                            <Textarea
                                id="model-intro"
                                value={formData.model_intro}
                                onChange={(e) => setFormData({ ...formData, model_intro: e.target.value })}
                                placeholder="请输入模特介绍（可选）"
                                rows={6}
                                className="resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model-cover">封面 URL (可选)</Label>
                            <Input
                                id="model-cover"
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
