'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { EditDialog } from '@/components/forms/edit-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { createStudio } from '@/app/actions/studios';
import { uploadStudioLogo } from '@/app/actions/upload-actions';

export function StudioCreateDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        studio_name: '',
        studio_intro: '',
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('请选择图片文件');
                return;
            }
            setLogoFile(file);
            const url = URL.createObjectURL(file);
            setLogoPreview(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.studio_name.trim()) {
            setError('请输入机构名称');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let logoUrl: string | undefined;

            // Upload logo if provided
            if (logoFile) {
                const logoFormData = new FormData();
                logoFormData.append('file', logoFile);
                const uploadResult = await uploadStudioLogo(logoFormData);

                if (uploadResult.success && uploadResult.url) {
                    logoUrl = uploadResult.url;
                } else {
                    setError('Logo上传失败');
                    setLoading(false);
                    return;
                }
            }

            const result = await createStudio({
                ...formData,
                studio_cover_url: logoUrl,
            });

            if (result.success) {
                toast.success('摄影机构创建成功');
                setOpen(false);
                // Reset form
                setFormData({
                    studio_name: '',
                    studio_intro: '',
                });
                setLogoFile(null);
                setLogoPreview('');
                // 刷新页面以显示新数据
                window.location.reload();
            } else {
                setError(result.error || '创建失败');
            }
        } catch (error) {
            setError('创建失败');
            console.error('Error creating studio:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
            </Button>
            <EditDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                title="新增摄影机构"
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                maxWidth="sm:max-w-[800px]"
            >
                <div className="grid grid-cols-[240px_1fr] gap-6 py-4">
                    {/* Left Column: Logo Preview */}
                    <div className="space-y-4">
                        <div className="aspect-square relative rounded-lg overflow-hidden border bg-muted shadow-sm">
                            {logoPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    无Logo
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="studio_name">
                                机构名称 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="studio_name"
                                value={formData.studio_name}
                                onChange={(e) => setFormData({ ...formData, studio_name: e.target.value })}
                                placeholder="请输入机构名称"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Logo设置</Label>
                            <div className="relative">
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <Button type="button" variant="outline" className="w-full">
                                    <Upload className="mr-2 h-4 w-4" /> 上传
                                </Button>
                            </div>
                            {logoFile && (
                                <p className="text-xs text-muted-foreground">
                                    已选择新文件: {logoFile.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="studio_intro">机构简介</Label>
                            <Textarea
                                id="studio_intro"
                                value={formData.studio_intro}
                                onChange={(e) => setFormData({ ...formData, studio_intro: e.target.value })}
                                placeholder="请输入机构简介"
                                rows={6}
                            />
                        </div>
                    </div>
                </div>
            </EditDialog>
        </>
    );
}
