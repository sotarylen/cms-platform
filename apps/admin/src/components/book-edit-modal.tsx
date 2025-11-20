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
      // 同时更新表单中的coverUrl为本地预览URL，方便用户看到选择的文件
      setFormData(prev => ({ ...prev, coverUrl: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 防止重复提交
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      // 检查是否有上传文件，如果有则上传并获取URL
      let finalCoverUrl = formData.coverUrl; // 默认使用表单中的URL
      if (coverFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('cover', coverFile);
        
        try {
          const uploadRes = await fetch(`/books/${book.id}/cover`, {
            method: 'POST',
            body: uploadFormData,
          });
          
          // 上传封面接口返回的是重定向，检查状态码是否为3xx重定向
          if (uploadRes.status >= 300 && uploadRes.status < 400) {
            // 从重定向URL中提取文件路径
            const redirectUrl = uploadRes.headers.get('Location') || uploadRes.url;
            const urlObj = new URL(redirectUrl);
            finalCoverUrl = urlObj.pathname; // 使用上传后的路径
            // 同时更新表单中的URL显示和预览区域
            setFormData(prev => ({
              ...prev,
              coverUrl: urlObj.pathname
            }));
            setCoverPreview(urlObj.pathname); // 更新预览区域显示相对路径
          } else if (uploadRes.ok) {
            // 兼容某些情况下可能返回200的情况
            const redirectUrl = uploadRes.headers.get('Location') || uploadRes.url;
            const urlObj = new URL(redirectUrl);
            finalCoverUrl = urlObj.pathname; // 使用上传后的路径
            // 同时更新表单中的URL显示和预览区域
            setFormData(prev => ({
              ...prev,
              coverUrl: urlObj.pathname
            }));
            setCoverPreview(urlObj.pathname); // 更新预览区域显示相对路径
          }
          // 如果上传失败，继续使用表单中的URL（可能是用户手动输入的）
        } catch (uploadError) {
          // 即使上传失败，也继续使用当前的URL
          console.error('上传失败:', uploadError);
        }
      }

      // 更新书籍信息（包括可能更新的封面URL）
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
          cover: finalCoverUrl || null, // 使用最终确定的封面URL
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>编辑书籍信息</h2>
          <div className="modal-header-actions">
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
              form="book-edit-form"
              className="modal-save"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
        <div className="modal-body">
          <form id="book-edit-form" onSubmit={handleSubmit} className="book-edit-form">
            <div className="form-row">
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
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cover">封面</label>
              <div className="cover-edit-section">
                <div className="cover-preview">
                  {coverPreview ? (
                    <img
                      src={coverPreview.startsWith('/') ? coverPreview : coverPreview}
                      alt="封面预览"
                      className="cover-preview-image"
                    />
                  ) : (
                    <div className="cover-preview-placeholder">
                      无封面
                    </div>
                  )}
                </div>
                <div className="cover-inputs">
                  <div className="form-group">
                    <label htmlFor="coverUrl">封面URL</label>
                    <input
                      id="coverUrl"
                      type="text"
                      value={formData.coverUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, coverUrl: e.target.value });
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

          </form>
        </div>
      </div>
    </div>
  );
}

