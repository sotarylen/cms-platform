'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditDialog } from '@/components/forms/edit-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2 } from 'lucide-react';

type ChapterEditModalProps = {
  chapter: {
    id: number;
    title: string;
    sortOrder: number | null;
  };
  bookId: number;
  open: boolean;
  onClose: () => void;
};

export function ChapterEditModal({ chapter, bookId, open, onClose }: ChapterEditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: chapter.title || '',
    sortOrder: chapter.sortOrder !== null ? chapter.sortOrder.toString() : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        chapter_title: formData.title || null,
      };

      if (formData.sortOrder.trim() !== '') {
        const sortOrder = parseInt(formData.sortOrder, 10);
        if (!isNaN(sortOrder)) {
          payload.chapter_sort = sortOrder;
        }
      } else {
        payload.chapter_sort = null;
      }

      const res = await fetch(`/api/books/${bookId}/chapters/${chapter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        const errorText = await res.text();
        let errorMessage = '未知错误';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorText;
        } catch {
          errorMessage = errorText || '更新失败';
        }
        setError(`更新失败: ${errorMessage}`);
      }
    } catch (error) {
      console.error('更新失败:', error);
      setError('更新失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`确定要删除章节 "${chapter.title}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/books/${bookId}/chapters/${chapter.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push(`/books/${bookId}`);
        router.refresh();
      } else {
        const errorText = await res.text();
        let errorMessage = '未知错误';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorText;
        } catch {
          errorMessage = errorText || '删除失败';
        }
        setError(`删除失败: ${errorMessage}`);
      }
    } catch (error) {
      console.error('删除失败:', error);
      setError('删除失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EditDialog
      isOpen={open}
      onClose={onClose}
      title="编辑章节信息"
      onSubmit={handleSubmit}
      loading={isSubmitting}
      error={error}
      maxWidth="sm:max-w-[500px]"
      leftActions={
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              删除中...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              删除章节
            </>
          )}
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">章节标题</Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="请输入章节标题"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">章节顺序号</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({ ...formData, sortOrder: e.target.value })
            }
            placeholder="请输入章节顺序号"
            disabled={isSubmitting}
          />
          <p className="text-sm text-muted-foreground">
            章节将按顺序号升序排列，留空则按ID排序
          </p>
        </div>
      </div>
    </EditDialog>
  );
}