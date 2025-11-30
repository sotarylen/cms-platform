'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';

type BookEditModalProps = {
  book: {
    id: number;
    name: string;
    author: string | null;
    source: string | null;
    category: string | null;
    introduce: string | null;
    cover: string | null;
  };
  open: boolean;
  onClose: () => void;
};

export function BookEditModal({ book, open, onClose }: BookEditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: book.name || '',
    author: book.author || '',
    source: book.source || '',
    category: book.category || '',
    introduce: book.introduce || '',
    coverUrl: book.cover || '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(book.cover || null);
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
      setFormData(prev => ({ ...prev, coverUrl: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let finalCoverUrl = formData.coverUrl;
      if (coverFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('cover', coverFile);

        try {
          const uploadRes = await fetch(`/books/${book.id}/cover`, {
            method: 'POST',
            body: uploadFormData,
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            if (data.url) {
              finalCoverUrl = data.url;
              setFormData(prev => ({ ...prev, coverUrl: data.url }));
              setCoverPreview(data.url);
            }
          } else {
            console.error('上传失败:', await uploadRes.text());
          }
        } catch (uploadError) {
          console.error('上传失败:', uploadError);
        }
      }

      const updateRes = await fetch(`/api/books/${book.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name || null,
          author: formData.author || null,
          source: formData.source || null,
          category: formData.category || null,
          introduce: formData.introduce || null,
          cover: finalCoverUrl || null,
        }),
      });

      if (updateRes.ok) {
        router.refresh();
        onClose();
      } else {
        const errorText = await updateRes.text();
        let errorMessage = '未知错误';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorText;
        } catch {
          errorMessage = errorText || '更新失败';
        }
        alert(`更新失败: ${errorMessage}`);
      }
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑书籍信息</DialogTitle>
          <DialogDescription>
            修改书籍的基本信息和封面
          </DialogDescription>
        </DialogHeader>
        <form id="book-edit-form" onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">书名</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入书名"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">作者</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="请输入作者"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">来源</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="请输入来源"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="请输入分类"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="introduce">简介</Label>
            <Textarea
              id="introduce"
              value={formData.introduce}
              onChange={(e) => setFormData({ ...formData, introduce: e.target.value })}
              placeholder="请输入简介"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>封面</Label>
            <div className="flex gap-4 items-start border rounded-md p-4">
              <div className="w-24 h-36 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0 border">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="封面预览"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coverUrl" className="text-xs">封面URL</Label>
                  <Input
                    id="coverUrl"
                    value={formData.coverUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, coverUrl: e.target.value });
                      setCoverPreview(e.target.value || null);
                    }}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    id="coverFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    上传图片
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="book-edit-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
