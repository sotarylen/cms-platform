'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { BookEditModal } from './book-edit-modal';

type BookEditButtonProps = {
  book: {
    id: number;
    name: string;
    author: string | null;
    source: string | null;
    category: string | null;
    introduce: string | null;
    cover: string | null;
  };
};

export function BookEditButton({ book }: BookEditButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="action-button"
        onClick={() => setIsOpen(true)}
        title="编辑书籍信息"
      >
        <i className="fas fa-edit"></i>
        <span>编辑</span>
      </button>
      {isOpen && createPortal(
        <BookEditModal book={book} onClose={() => setIsOpen(false)} />,
        document.body
      )}
    </>
  );
}