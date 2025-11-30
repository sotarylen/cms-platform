'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Loader2, Save, Upload } from 'lucide-react';
import { Album, AlbumModel, AlbumStudio } from '@/lib/types';
import { updateAlbumAction } from '@/app/actions/album-actions';
import { uploadAlbumCoverAction } from '@/app/actions/upload-actions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AlbumEditDialogProps {
    album: Album;
    models: AlbumModel[];
    studios: AlbumStudio[];
}

export function AlbumEditDialog({ album, models, studios }: AlbumEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: album.title || album.resource_title_raw,
        modelName: album.model_name || '',
        studioName: album.studio_name || '',
        resource_url: album.resource_url || '',
        source_page_url: album.source_page_url || '',
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(album.source_page_url || '');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let coverUrl = formData.source_page_url;

            // Upload cover if selected
            if (coverFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', coverFile);
                const uploadResult = await uploadAlbumCoverAction(album.id, uploadFormData);
                if (uploadResult.success && uploadResult.url) {
                    coverUrl = uploadResult.url;
                } else {
                    toast.error('封面上传失败');
                    setIsLoading(false);
                    return;
                }
            }

            // Find model ID by name, or use the name to create new one
            let modelValue: number | string | undefined;
            if (formData.modelName.trim()) {
                const matchedModel = models.find(m => m.name.toLowerCase() === formData.modelName.toLowerCase());
                modelValue = matchedModel ? matchedModel.id : formData.modelName;
            }

            // Find studio ID by name
            let studioId: number | undefined;
            if (formData.studioName.trim()) {
                const matchedStudio = studios.find(s => s.studio_name.toLowerCase() === formData.studioName.toLowerCase());
                studioId = matchedStudio?.studio_id;

                if (!matchedStudio) {
                    toast.error(`工作室 "${formData.studioName}" 不存在，请选择已有工作室`);
                    setIsLoading(false);
                    return;
                }
            }

            const result = await updateAlbumAction(album.id, {
                title: formData.title,
                model: modelValue,
                studio_id: studioId,
                resource_url: formData.resource_url,
                source_page_url: coverUrl,
            });

            if (result.success) {
                toast.success('图册更新成功');
                setOpen(false);
                setCoverFile(null);
                router.refresh();
            } else {
                toast.error('更新失败');
            }
        } catch (error) {
            toast.error('发生错误');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> 编辑
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>编辑图册信息</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-[240px_1fr] gap-6">
                        {/* Left Column: Cover Preview */}
                        <div className="space-y-4">
                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden border bg-muted shadow-sm group">
                                {previewUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={previewUrl}
                                        alt="Cover Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        无封面
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Form Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">标题</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="modelName">模特</Label>
                                    <Input
                                        id="modelName"
                                        value={formData.modelName}
                                        onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                                        placeholder="输入模特名称"
                                        list="model-suggestions"
                                    />
                                    <datalist id="model-suggestions">
                                        {models.map(m => (
                                            <option key={m.id} value={m.name} />
                                        ))}
                                    </datalist>
                                    <p className="text-xs text-muted-foreground">
                                        输入名称，保存时自动匹配或创建
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="studioName">工作室</Label>
                                    <Input
                                        id="studioName"
                                        value={formData.studioName}
                                        onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                                        placeholder="输入工作室名称"
                                        list="studio-suggestions"
                                    />
                                    <datalist id="studio-suggestions">
                                        {studios.map(s => (
                                            <option key={s.studio_id} value={s.studio_name} />
                                        ))}
                                    </datalist>
                                    <p className="text-xs text-muted-foreground">
                                        必须选择已有工作室
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>封面设置</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={formData.source_page_url}
                                        onChange={(e) => {
                                            setFormData({ ...formData, source_page_url: e.target.value });
                                            setPreviewUrl(e.target.value);
                                        }}
                                        placeholder="封面链接..."
                                        className="flex-1"
                                    />
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <Button type="button" variant="outline" className="w-full">
                                            <Upload className="mr-2 h-4 w-4" /> 上传
                                        </Button>
                                    </div>
                                </div>
                                {coverFile && (
                                    <p className="text-xs text-muted-foreground">
                                        已选择新文件: {coverFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resource_url">原文链接</Label>
                                <Input
                                    id="resource_url"
                                    value={formData.resource_url}
                                    onChange={(e) => setFormData({ ...formData, resource_url: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            取消
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            保存
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
