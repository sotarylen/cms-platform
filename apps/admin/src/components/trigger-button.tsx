"use client";

import React, { useState } from 'react';

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
    <>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {isLoading ? '抓取中...' : children}
      </button>
      {error && (
        <div className="text-red-500 text-sm mt-1">
          错误: {error}
        </div>
      )}
    </>
  );
};

export default TriggerButton;