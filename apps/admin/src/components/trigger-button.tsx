"use client";

import React, { useState } from 'react';

export default function TriggerButton({ bookId }: { bookId: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/n8n/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || '请求失败');
      }
      setDone(true);
      // 简单反馈
      alert('已触发抓取任务（n8n）');
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '请求失败');
      alert('触发失败：' + (err?.message ?? '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="action-button"
      onClick={onClick}
      disabled={loading || done}
      aria-disabled={loading || done}
      title={done ? '已触发' : '抓取章节'}
      style={{ padding: '6px 10px', fontSize: 13 }}
    >
      {loading ? '抓取中…' : done ? '已触发' : '抓取章节'}
    </button>
  );
}
