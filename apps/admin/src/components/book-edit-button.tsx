'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookEditModal } from './book-edit-modal';
import { Edit } from 'lucide-react';

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
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="编辑书籍信息"
      >
        <Edit className="mr-2 h-4 w-4" />
        编辑
      </Button>
      <BookEditModal
        book={book}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}