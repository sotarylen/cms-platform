'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Eye, 
  Save, 
  X,
  FileText,
  Type,
  Hash
} from 'lucide-react';
import type { ParseResult } from './txt-upload-dialog';

interface ChapterPreviewProps {
  parseResult: ParseResult;
  onEditChapter: (index: number, newTitle: string, newContent: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const ChapterPreview: React.FC<ChapterPreviewProps> = ({
  parseResult,
  onEditChapter,
  onConfirm,
  onBack
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([0]));
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const toggleChapter = (index: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChapters(newExpanded);
  };

  const startEdit = (index: number) => {
    setEditingChapter(index);
    setEditTitle(parseResult.chapters[index].title);
    setEditContent(parseResult.chapters[index].content);
  };

  const saveEdit = () => {
    if (editingChapter !== null) {
      onEditChapter(editingChapter, editTitle, editContent);
      setEditingChapter(null);
    }
  };

  const cancelEdit = () => {
    setEditingChapter(null);
    setEditTitle('');
    setEditContent('');
  };

  const getTotalWords = () => {
    return parseResult.chapters.reduce((total, chapter) => {
      return total + chapter.content.length;
    }, 0);
  };

  const getAverageWordsPerChapter = () => {
    if (parseResult.chapters.length === 0) return 0;
    return Math.round(getTotalWords() / parseResult.chapters.length);
  };

  return (
    <div className="space-y-6">
      {/* 书籍概览 */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{parseResult.totalChapters}</div>
            <div className="text-sm text-gray-500">章节数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getTotalWords().toLocaleString()}</div>
            <div className="text-sm text-gray-500">总字数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{getAverageWordsPerChapter()}</div>
            <div className="text-sm text-gray-500">平均字数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {parseResult.bookTitle.length > 10 
                ? parseResult.bookTitle.substring(0, 10) + '...' 
                : parseResult.bookTitle}
            </div>
            <div className="text-sm text-gray-500">书名</div>
          </div>
        </div>
      </Card>

      {/* 书籍信息编辑 */}
      <Card className="p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          书籍信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">书名</label>
            <p className="text-lg font-medium">{parseResult.bookTitle}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">作者</label>
            <p className="text-lg font-medium">{parseResult.author || '未知'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">摘要</label>
            <p className="text-sm text-gray-700 mt-1">
              {parseResult.summary || '暂无摘要'}
            </p>
          </div>
        </div>
      </Card>

      {/* 章节列表 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Hash className="w-4 h-4" />
            章节列表 ({parseResult.totalChapters}个)
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <X className="w-4 h-4 mr-2" />
              返回设置
            </Button>
            <Button onClick={onConfirm} size="sm">
              确认导入
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {parseResult.chapters.map((chapter, index) => (
              <div key={index} className="border rounded-lg">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleChapter(index)}
                >
                  <div className="flex items-center gap-3">
                    {expandedChapters.has(index) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Badge variant="outline">第{chapter.sortOrder}章</Badge>
                        <Type className="w-4 h-4" />
                        {editingChapter === index ? (
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-6 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span>{chapter.title}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {chapter.content.length} 字符
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {editingChapter === index ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEdit();
                          }}
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(index);
                        }}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {expandedChapters.has(index) && (
                  <div className="border-t p-3">
                    {editingChapter === index ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={6}
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">
                        <ScrollArea className="h-32">
                          <pre className="whitespace-pre-wrap font-sans">
                            {chapter.content.substring(0, 500)}
                            {chapter.content.length > 500 && '...'}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ChapterPreview;