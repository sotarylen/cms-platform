"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Loader2 } from 'lucide-react';

interface BookFetchButtonProps {
  bookId: number;
  status: number | null;
  onFetchComplete?: () => void;
  className?: string;
}

const BookFetchButton: React.FC<BookFetchButtonProps> = ({
  bookId,
  status,
  onFetchComplete,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 根据书籍状态确定按钮文本
  const getButtonText = () => {
    if (status === 1) {
      return '重新抓取';
    }
    return '抓取章节';
  };

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 触发抓取任务
      const response = await fetch(`/api/books/${bookId}/fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRefetch: status === 1 })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '抓取失败');
      }

      // 显示成功消息
      setSuccess('已成功触发章节抓取任务');

      // 等待5秒后刷新页面或执行回调
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 触发完成回调（如果有的话）
      if (onFetchComplete) {
        onFetchComplete();
      } else {
        // 如果没有回调，则刷新当前页面
        window.location.reload();
      }
    } catch (err: any) {
      const errorMessage = err.message || '发生未知错误';
      setError(errorMessage);
      console.error('抓取章节失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : status === 1 ? (
          <RefreshCw className="mr-2 h-4 w-4" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isLoading ? '抓取中...' : getButtonText()}
      </Button>
      {error && (
        <div className="text-red-500 text-xs mt-1">
          错误: {error}
        </div>
      )}
      {success && !isLoading && (
        <div className="text-green-500 text-xs mt-1">
          {success}，5秒后刷新...
        </div>
      )}
    </div>
  );
};

export default BookFetchButton;