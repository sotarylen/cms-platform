'use client';

import { useState } from 'react';

const MIN_SIZE = 14;
const MAX_SIZE = 24;
const STEP = 1;

type Props = {
  content: string;
};

export function ChapterContentViewer({ content }: Props) {
  const [fontSize, setFontSize] = useState(22);

  const setSize = (size: number) => {
    const clamped = Math.min(MAX_SIZE, Math.max(MIN_SIZE, size));
    setFontSize(clamped);
  };

  return (
    <div className="reader">
      <div className="reader-toolbar">
        <span>字号：{fontSize}px</span>
        <div className="reader-toolbar-buttons">
          <button
            type="button"
            onClick={() => setSize(fontSize - STEP)}
            disabled={fontSize <= MIN_SIZE}
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setSize(fontSize + STEP)}
            disabled={fontSize >= MAX_SIZE}
          >
            +
          </button>
        </div>
      </div>
      <article
        className="reader-article"
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

