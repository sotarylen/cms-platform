'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Plus, PlusCircle } from 'lucide-react';
import { AlbumModel, AlbumStudio } from '@/lib/types';
import { createAlbumAction } from '@/app/actions/album-actions';
import { Button } from '@/components/ui/button';
import { EditDialog } from '@/components/forms/edit-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CreateAlbumDialogProps {
    models: AlbumModel[];
    studios: AlbumStudio[];
}

export function CreateAlbumDialog({ models, studios }: CreateAlbumDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [continueAdding, setContinueAdding] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        modelName: '',
        studioName: '',
        source_page_url: '',
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const performSave = async () => {
        setError(null);

        try {
            // Find studio ID by name
            let studioId: number | undefined;
            if (formData.studioName.trim()) {
                const matchedStudio = studios.find(s => s.studio_name.toLowerCase() === formData.studioName.toLowerCase());
                studioId = matchedStudio?.studio_id;

                if (!matchedStudio) {
                    setError(`工作室 "${formData.studioName}" 不存在，请选择已有工作室`);
                    return false;
                }
            }

            const payload = {
                title: formData.title,
                model: formData.modelName,
                studio_id: studioId,
                source_page_url: formData.source_page_url,
            };

            let coverFormData: FormData | undefined;
            if (coverFile) {
                coverFormData = new FormData();
                coverFormData.append('file', coverFile);
            }

            const result = await createAlbumAction(payload, coverFormData);

            if (result.success) {
                return true;
            } else {
                setError(result.error || '创建失败');
                return false;
            }
        } catch (error) {
            setError('发生错误');
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await performSave();

        if (success) {
            toast.success('图册创建成功');
            setOpen(false);
            // Reset form
            setFormData({
                title: '',
                modelName: '',
                studioName: '',
                source_page_url: '',
            });
            setCoverFile(null);
            setPreviewUrl('');
            router.refresh();
        }

        setIsLoading(false);
    };

    const handleContinueAdding = async () => {
        setContinueAdding(true);
        setIsLoading(true);

        const success = await performSave();

        if (success) {
            toast.success('图册创建成功，继续添加');
            // Only reset title and cover, keep model and studio
            setFormData({
                ...formData,
                title: '',
                source_page_url: '',
            });
            setCoverFile(null);
            setPreviewUrl('');
            router.refresh();
        }

        setIsLoading(false);
        setContinueAdding(false);
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} size="icon">
                <Plus className="h-4 w-4" />
            </Button>
            <EditDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                title="添加新图册"
                onSubmit={handleSubmit}
                loading={isLoading}
                error={error}
                maxWidth="sm:max-w-[800px]"
                rightActions={
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleContinueAdding}
                        disabled={isLoading}
                    >
                        {continueAdding ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                保存中...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                继续添加
                            </>
                        )}
                    </Button>
                }
            >
                <div className="grid grid-cols-[240px_1fr] gap-6 py-4">
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
                            <Label htmlFor="create-title">标题 <span className="text-red-500">*</span></Label>
                            <Input
                                id="create-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="输入图册标题"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-modelName">模特</Label>
                                <Input
                                    id="create-modelName"
                                    value={formData.modelName}
                                    onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                                    placeholder="输入模特名称"
                                    list="create-model-suggestions"
                                />
                                <datalist id="create-model-suggestions">
                                    {models.map(m => (
                                        <option key={m.id} value={m.name} />
                                    ))}
                                </datalist>
                                <p className="text-xs text-muted-foreground">
                                    输入名称，保存时自动匹配或创建
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create-studioName">工作室</Label>
                                <Input
                                    id="create-studioName"
                                    value={formData.studioName}
                                    onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                                    placeholder="输入工作室名称"
                                    list="create-studio-suggestions"
                                />
                                <datalist id="create-studio-suggestions">
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
                    </div>
                </div>
            </EditDialog>
        </>
    );
}
