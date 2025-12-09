'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Book,
  User,
  FileText,
  Hash
} from 'lucide-react';
import type { ParseResult } from './txt-upload-dialog';

interface TxtImportStepProps {
  parseResult: ParseResult;
  originalFilename: string;
  onImportCompleted: (bookId: number) => void;
  onBack: () => void;
  onLoadingChange: (loading: boolean) => void;
}

const TxtImportStep: React.FC<TxtImportStepProps> = ({
  parseResult,
  originalFilename,
  onImportCompleted,
  onBack,
  onLoadingChange
}) => {
  const [importData, setImportData] = useState({
    bookTitle: parseResult.bookTitle,
    author: parseResult.author,
    category: '',
    summary: parseResult.summary,
    cover: ''
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bookId: number } | null>(null);

  const categories = [
    '玄幻',
    '奇幻',
    '武侠',
    '仙侠',
    '都市',
    '历史',
    '军事',
    '游戏',
    '竞技',
    '科幻',
    '悬疑',
    '恐怖',
    '言情',
    '同人',
    '其他'
  ];

  const handleImport = async () => {
    if (!importData.bookTitle.trim()) {
      setError('请填写书名');
      return;
    }

    setImportStatus('importing');
    setImportProgress(0);
    setError(null);
    onLoadingChange(true);

    try {
      // 模拟导入进度
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload/txt/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: originalFilename,
          bookTitle: importData.bookTitle,
          author: importData.author,
          category: importData.category,
          summary: importData.summary,
          chapters: parseResult.chapters,
          cover: importData.cover
        })
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '导入失败');
      }

      const result = await response.json();
      setResult({ bookId: result.bookId });
      setImportStatus('success');

      // 延迟跳转到新创建的书籍页面
      setTimeout(() => {
        onImportCompleted(result.bookId);
      }, 1500);

    } catch (err: any) {
      setImportStatus('error');
      setError(err.message || '导入失败');
      onLoadingChange(false);
    }
  };

  const getTotalWords = () => {
    return parseResult.chapters.reduce((total, chapter) => {
      return total + chapter.content.length;
    }, 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 导入概览 */}
      <Card className="p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" />
          导入概览
        </h3>
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
            <div className="text-2xl font-bold text-purple-600">{originalFilename}</div>
            <div className="text-sm text-gray-500">源文件</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">准备就绪</div>
            <div className="text-sm text-gray-500">导入状态</div>
          </div>
        </div>
      </Card>

      {/* 书籍信息设置 */}
      <Card className="p-4 space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Book className="w-4 h-4" />
          书籍信息
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bookTitle">
              书名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bookTitle"
              value={importData.bookTitle}
              onChange={(e) => setImportData(prev => ({
                ...prev,
                bookTitle: e.target.value
              }))}
              placeholder="请输入书名"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="author">
              作者
            </Label>
            <Input
              id="author"
              value={importData.author}
              onChange={(e) => setImportData(prev => ({
                ...prev,
                author: e.target.value
              }))}
              placeholder="请输入作者姓名"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category">分类</Label>
            <Select 
              value={importData.category} 
              onValueChange={(value) => setImportData(prev => ({
                ...prev,
                category: value
              }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="选择书籍分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cover">封面URL（可选）</Label>
            <Input
              id="cover"
              value={importData.cover}
              onChange={(e) => setImportData(prev => ({
                ...prev,
                cover: e.target.value
              }))}
              placeholder="请输入封面图片URL"
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="summary">摘要</Label>
            <Textarea
              id="summary"
              value={importData.summary}
              onChange={(e) => setImportData(prev => ({
                ...prev,
                summary: e.target.value
              }))}
              placeholder="请输入书籍摘要"
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* 章节信息 */}
      <Card className="p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          章节信息
        </h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {parseResult.chapters.slice(0, 5).map((chapter, index) => (
            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
              <span className="font-medium">第{chapter.sortOrder}章</span>
              <span className="text-gray-600">{chapter.title}</span>
              <span className="text-gray-500">{chapter.content.length}字符</span>
            </div>
          ))}
          {parseResult.chapters.length > 5 && (
            <div className="text-sm text-gray-500 text-center">
              还有 {parseResult.chapters.length - 5} 个章节...
            </div>
          )}
        </div>
      </Card>

      {/* 导入按钮 */}
      <div className="flex justify-center">
        {importStatus === 'idle' && (
          <Button onClick={handleImport} size="lg" className="min-w-32">
            <Upload className="w-4 h-4 mr-2" />
            开始导入
          </Button>
        )}
        
        {importStatus === 'importing' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
            <div className="space-y-2">
              <p className="font-medium">正在导入书籍数据...</p>
              <div className="w-64">
                <Progress value={importProgress} className="h-2" />
                <p className="text-sm text-gray-500 mt-1">{importProgress}%</p>
              </div>
            </div>
          </div>
        )}
        
        {importStatus === 'success' && result && (
          <div className="text-center space-y-4">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
            <div>
              <p className="font-medium text-green-700">导入成功！</p>
              <p className="text-sm text-gray-500">
                书籍已创建，ID: {result.bookId}
              </p>
              <p className="text-sm text-gray-500">
                正在跳转到书籍页面...
              </p>
            </div>
          </div>
        )}
        
        {importStatus === 'error' && (
          <div className="text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <div>
              <p className="font-medium text-red-700">导入失败</p>
              <p className="text-sm text-red-600">{error}</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => {
                  setImportStatus('idle');
                  setError(null);
                  setImportProgress(0);
                }}
              >
                重新导入
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TxtImportStep;