'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChapterEditModal } from './chapter-edit-modal';
import { Edit } from 'lucide-react';

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
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="编辑章节信息"
      >
        <Edit className="mr-2 h-4 w-4" />
        编辑
      </Button>
      <ChapterEditModal
        chapter={chapter}
        bookId={bookId}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}