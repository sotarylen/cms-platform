"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface TriggerButtonProps {
  bookId?: number;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const TriggerButton: React.FC<TriggerButtonProps> = ({
  bookId,
  onClick,
  children = '抓取章节',
  className = '',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!bookId) {
      if (onClick) onClick();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/books/${bookId}/fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '抓取失败');
      }

      // 显示成功消息
      alert(result.message || '已成功触发章节抓取任务');
    } catch (err: any) {
      setError(err.message || '发生未知错误');
      console.error('抓取章节失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isLoading ? '抓取中...' : children}
      </Button>
      {error && (
        <div className="text-red-500 text-xs mt-1">
          错误: {error}
        </div>
      )}
    </div>
  );
};

export default TriggerButton;