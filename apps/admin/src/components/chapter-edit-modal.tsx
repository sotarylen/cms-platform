'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ChapterEditModalProps = {
  chapter: {
    id: number;
    title: string;
    sortOrder: number | null;
  };
  bookId: number;
  onClose: () => void;
};

export function ChapterEditModal({ chapter, bookId, onClose }: ChapterEditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: chapter.title || '',
    sortOrder: chapter.sortOrder !== null ? chapter.sortOrder.toString() : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      // 构造要发送的数据
      const payload: any = {
        chapter_title: formData.title || null,
      };

      // 只有当用户输入了排序号时才更新
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
        alert(`更新失败: ${errorMessage}`);
      }
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败，请重试');
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
        alert(`删除失败: ${errorMessage}`);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>编辑章节信息</h2>
          <div className="modal-header-actions">
            <button
              type="button"
              className="action-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <i className="fas fa-times"></i>
              取消
            </button>
            <button
              type="button"
              className="action-button danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? '删除中...' : (
                <>
                  <i className="fas fa-trash"></i>
                  删除章节
                </>
              )}
            </button>
            <button
              type="submit"
              form="chapter-edit-form"
              className="modal-save"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : (
                <>
                  <i className="fas fa-save"></i>
                  保存
                </>
              )}
            </button>
          </div>
        </div>
        <div className="modal-body">
          <form id="chapter-edit-form" onSubmit={handleSubmit} className="book-edit-form">
            <div className="form-group">
              <label htmlFor="title">章节标题</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="请输入章节标题"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sortOrder">章节顺序号</label>
              <input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: e.target.value })
                }
                placeholder="请输入章节顺序号"
              />
              <p className="form-help-text">
                章节将按顺序号升序排列，留空则按ID排序
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}