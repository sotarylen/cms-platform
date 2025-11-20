'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  onClose: () => void;
};

export function BookEditModal({ book, onClose }: BookEditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 如果有上传文件，先上传封面
      let finalCoverUrl = formData.coverUrl;
      if (coverFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('cover', coverFile);
        const uploadRes = await fetch(`/books/${book.id}/cover`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: uploadFormData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalCoverUrl = uploadData.url;
        } else {
          const error = await uploadRes.json();
          alert(`封面上传失败: ${error.message || '未知错误'}`);
          setIsSubmitting(false);
          return;
        }
      }

      // 更新书籍信息
      const updateRes = await fetch(`/api/books/${book.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        const error = await updateRes.json();
        alert(`更新失败: ${error.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>编辑书籍信息</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="book-edit-form">
          <div className="form-group">
            <label htmlFor="author">作者</label>
            <input
              id="author"
              type="text"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              placeholder="请输入作者"
            />
          </div>

          <div className="form-group">
            <label htmlFor="source">来源</label>
            <input
              id="source"
              type="text"
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              placeholder="请输入来源"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">分类</label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="请输入分类"
            />
          </div>

          <div className="form-group">
            <label htmlFor="introduce">简介</label>
            <textarea
              id="introduce"
              value={formData.introduce}
              onChange={(e) =>
                setFormData({ ...formData, introduce: e.target.value })
              }
              placeholder="请输入简介"
              rows={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cover">封面</label>
            <div className="cover-edit-section">
              <div className="cover-preview">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="封面预览"
                    style={{
                      width: '100%',
                      maxWidth: '200px',
                      aspectRatio: '2/3',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '200px',
                      aspectRatio: '2/3',
                      borderRadius: '8px',
                      border: '1px dashed var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                    }}
                  >
                    无封面
                  </div>
                )}
              </div>
              <div className="cover-inputs">
                <div className="form-group">
                  <label htmlFor="coverUrl">封面URL</label>
                  <input
                    id="coverUrl"
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, coverUrl: e.target.value });
                      if (e.target.value) {
                        setCoverPreview(e.target.value);
                      }
                    }}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="coverFile">或上传图片</label>
                  <input
                    ref={fileInputRef}
                    id="coverFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="action-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="action-button action-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

