"use client";

import React, { useState } from 'react';

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
  const [debugInfo, setDebugInfo] = useState<{
    requestId: string | null;
    startTime: number | null;
    endTime: number | null;
    responseStatus: number | null;
    responseData: any;
  }>({
    requestId: null,
    startTime: null,
    endTime: null,
    responseStatus: null,
    responseData: null
  });

  // 根据书籍状态确定按钮文本
  const getButtonText = () => {
    if (status === 1) {
      return '重新抓取';
    }
    return '抓取章节';
  };

  const handleClick = async () => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 更新调试信息
    setDebugInfo(prev => ({
      ...prev,
      requestId,
      startTime: Date.now(),
      endTime: null,
      responseStatus: null,
      responseData: null
    }));

    console.log(`[BookFetchButton] 开始抓取书籍 ${bookId}`, {
      requestId,
      timestamp: new Date().toISOString(),
      bookId,
      isRefetch: status === 1
    });

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
      
      // 更新调试信息
      setDebugInfo(prev => ({
        ...prev,
        responseStatus: response.status,
        responseData: result
      }));

      console.log(`[BookFetchButton] 收到响应`, {
        requestId,
        status: response.status,
        responseTime: `${Date.now() - (debugInfo.startTime || Date.now())}ms`,
        response: result
      });
      
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
      // 更新结束时间
      setDebugInfo(prev => ({
        ...prev,
        endTime: Date.now()
      }));
      
      console.log(`[BookFetchButton] 操作完成`, {
        requestId: debugInfo.requestId,
        duration: `${(debugInfo.endTime || Date.now()) - (debugInfo.startTime || Date.now())}ms`,
        finalStatus: error ? 'error' : 'success'
      });
      
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`action-button ${className}`}
      >
        <i className={`fas ${status === 1 ? 'fa-sync' : 'fa-download'}`}></i>
        {isLoading ? '抓取中...' : getButtonText()}
      </button>
      {error && (
        <div className="text-red-500 text-sm mt-1">
          错误: {error}
        </div>
      )}
      {success && !isLoading && (
        <div className="text-green-500 text-sm mt-1">
          {success}，5秒后将刷新页面...
        </div>
      )}
    </>
  );
};

export default BookFetchButton;