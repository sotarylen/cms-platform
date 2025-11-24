'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChapterEditModal } from './chapter-edit-modal';

type ChapterEditButtonProps = {
  chapter: {
    id: number;
    title: string;
    sortOrder: number | null;
  };
  bookId: number;
};

export function ChapterEditButton({ chapter, bookId }: ChapterEditButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="action-button"
        onClick={() => setIsOpen(true)}
        title="编辑章节信息"
      >
        <i className="fas fa-edit"></i>
        <span>编辑</span>
      </button>
      {isOpen && createPortal(
        <ChapterEditModal 
          chapter={chapter} 
          bookId={bookId}
          onClose={() => setIsOpen(false)} 
        />,
        document.body
      )}
    </>
  );
}