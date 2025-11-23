'use client';

import { useState } from 'react';
import Link from 'next/link';

const MIN_SIZE = 16;
const MAX_SIZE = 28;
const STEP = 1;

type Props = {
  content: string;
  prevChapterHref?: string;
  nextChapterHref?: string;
  bookHref: string;
  prevChapterTitle?: string;
  nextChapterTitle?: string;
};

export function ChapterContentViewer({ 
  content,
  prevChapterHref,
  nextChapterHref,
  bookHref,
  prevChapterTitle,
  nextChapterTitle
}: Props) {
  const [fontSize, setFontSize] = useState(22);
  const [bgColor, setBgColor] = useState('dark'); // dark, sepia, light, green, blue, night, contrast

  const setSize = (size: number) => {
    const clamped = Math.min(MAX_SIZE, Math.max(MIN_SIZE, size));
    setFontSize(clamped);
  };

  const setBackground = (color: string) => {
    setBgColor(color);
  };

  return (
    <div className="reader">
      <div className="reader-toolbar">
        <div className="reader-toolbar-group">
          <div className="reader-toolbar-buttons">
            <button
              type="button"
              onClick={() => setSize(fontSize - STEP)}
              disabled={fontSize <= MIN_SIZE}
              title="减小字号"
            >
              <i className="fas fa-minus"></i>
            </button>
            <span className="reader-toolbar-label">{fontSize}px</span>
            <button
              type="button"
              onClick={() => setSize(fontSize + STEP)}
              disabled={fontSize >= MAX_SIZE}
              title="增大字号"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <div className="reader-toolbar-group">
          <div className="reader-toolbar-buttons">
            <button
              type="button"
              className={bgColor === 'dark' ? 'active' : ''}
              onClick={() => setBackground('dark')}
              title="深色背景"
            >
              <i className="fas fa-moon"></i>
            </button>
            <button
              type="button"
              className={bgColor === 'sepia' ? 'active' : ''}
              onClick={() => setBackground('sepia')}
              title="复古背景"
            >
              <i className="fas fa-book"></i>
            </button>
            <button
              type="button"
              className={bgColor === 'light' ? 'active' : ''}
              onClick={() => setBackground('light')}
              title="浅色背景"
            >
              <i className="fas fa-sun"></i>
            </button>
            <button
              type="button"
              className={bgColor === 'green' ? 'active' : ''}
              onClick={() => setBackground('green')}
              title="绿色背景"
            >
              <i className="fas fa-leaf"></i>
            </button>
            <button
              type="button"
              className={bgColor === 'blue' ? 'active' : ''}
              onClick={() => setBackground('blue')}
              title="蓝色背景"
            >
              <i className="fas fa-tint"></i>
            </button>
            <button
              type="button"
              className={bgColor === 'night' ? 'active' : ''}
              onClick={() => setBackground('night')}
              title="夜间背景"
            >
              <i className="fas fa-star"></i>
            </button>
            <button
              type="button"
              className={bgColor === 'contrast' ? 'active' : ''}
              onClick={() => setBackground('contrast')}
              title="高对比度"
            >
              <i className="fas fa-adjust"></i>
            </button>
          </div>
        </div>
      </div>
      <article
        className={`reader-article ${bgColor}`}
        style={{
          fontSize,
          lineHeight: 1.85,
        }}
      >
        {content}
      </article>
    </div>
  );
}