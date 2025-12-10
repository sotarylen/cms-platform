'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Settings,
  Play,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3
} from 'lucide-react';
import type { UploadFileInfo, ParseResult } from './txt-upload-dialog';
import ChapterPreview from './chapter-preview';

interface TxtParseStepProps {
  fileInfo: UploadFileInfo;
  onParseCompleted: (result: ParseResult) => void;
  onBack: () => void;
  onLoadingChange: (loading: boolean) => void;
}

const TxtParseStep: React.FC<TxtParseStepProps> = ({
  fileInfo,
  onParseCompleted,
  onBack,
  onLoadingChange
}) => {
  const [parseSettings, setParseSettings] = useState({
    // 更宽容的默认正则：支持 "第x章"、"Chapter x"、纯数字章节等常见的格式
    // 解释：
    // (第)? 可能有"第"
    // [0-9一二三四五六七八九十百千]+ 数字（阿拉伯或中文）
    // (章|节|Chapter|Episode)? 后缀
    // 或者直接 Chapter 开头
    chapterPattern: '(^\\s*第?[0-9一二三四五六七八九十百千]+[章节].*|^\\s*Chapter\\s*[0-9]+.*)',
    autoGenerateSummary: true,
    bookTitle: '',
    author: ''
  });
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'settings' | 'preview'>('settings');

  const handleParse = async () => {
    setParseStatus('parsing');
    setParseProgress(0);
    setError(null);
    onLoadingChange(true);

    try {
      // 模拟解析进度
      const progressInterval = setInterval(() => {
        setParseProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 15;
        });
      }, 300);

      const response = await fetch('/api/upload/txt/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileInfo.filename,
          options: parseSettings
        })
      });

      clearInterval(progressInterval);
      setParseProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '解析失败');
      }

      const result = await response.json();
      setParseResult(result.result);
      setParseStatus('success');

      // 延迟显示预览
      setTimeout(() => {
        setPreviewMode('preview');
      }, 500);

    } catch (err: any) {
      setParseStatus('error');
      setError(err.message || '解析失败');
      onLoadingChange(false);
    }
  };

  const handleConfirm = () => {
    if (parseResult) {
      onParseCompleted(parseResult);
    }
  };

  const handleEditChapter = useCallback((index: number, newTitle: string, newContent: string) => {
    if (parseResult) {
      const updatedChapters = [...parseResult.chapters];
      updatedChapters[index] = {
        ...updatedChapters[index],
        title: newTitle,
        content: newContent
      };
      setParseResult({
        ...parseResult,
        chapters: updatedChapters
      });
    }
  }, [parseResult]);

  return (
    <div className="p-6 space-y-6">
      {/* 模式切换 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === 'settings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            解析设置
          </Button>
          <Button
            variant={previewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('preview')}
            disabled={!parseResult}
          >
            <Eye className="w-4 h-4 mr-2" />
            章节预览
          </Button>
        </div>

        {parseResult && (
          <div className="text-sm text-gray-500">
            共 {parseResult.totalChapters} 个章节
          </div>
        )}
      </div>

      {previewMode === 'settings' && (
        <div className="space-y-6">
          {/* 文件信息 */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              文件信息
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-500">文件名</Label>
                <p className="font-medium">{fileInfo.filename}</p>
              </div>
              <div>
                <Label className="text-gray-500">文件大小</Label>
                <p className="font-medium">{(fileInfo.size / 1024).toFixed(1)} KB</p>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-500">内容长度</Label>
                <p className="font-medium">{fileInfo.contentLength?.toLocaleString()} 字符</p>
              </div>
            </div>
          </Card>

          {/* 解析设置 */}
          <Card className="p-4 space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              解析设置
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="chapterPattern">章节识别模式</Label>
                <Input
                  id="chapterPattern"
                  value={parseSettings.chapterPattern}
                  onChange={(e) => setParseSettings(prev => ({
                    ...prev,
                    chapterPattern: e.target.value
                  }))}
                  placeholder="例如：第[0-9一二三四五六七八九十]+章"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  使用正则表达式匹配章节标题，支持中文数字和阿拉伯数字
                </p>
              </div>

              <div>
                <Label htmlFor="bookTitle">书名（可选）</Label>
                <Input
                  id="bookTitle"
                  value={parseSettings.bookTitle}
                  onChange={(e) => setParseSettings(prev => ({
                    ...prev,
                    bookTitle: e.target.value
                  }))}
                  placeholder="如未填写，将从文档中自动提取"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="author">作者（可选）</Label>
                <Input
                  id="author"
                  value={parseSettings.author}
                  onChange={(e) => setParseSettings(prev => ({
                    ...prev,
                    author: e.target.value
                  }))}
                  placeholder="如未填写，将从文档中自动提取"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoGenerateSummary"
                  checked={parseSettings.autoGenerateSummary}
                  onCheckedChange={(checked) => setParseSettings(prev => ({
                    ...prev,
                    autoGenerateSummary: checked === true
                  }))}
                />
                <Label htmlFor="autoGenerateSummary">自动生成书籍摘要</Label>
              </div>
            </div>
          </Card>

          {/* 解析按钮 */}
          <div className="flex justify-center">
            {parseStatus === 'idle' && (
              <Button onClick={handleParse} size="lg">
                <Play className="w-4 h-4 mr-2" />
                开始解析
              </Button>
            )}

            {parseStatus === 'parsing' && (
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
                <div className="space-y-2">
                  <p className="font-medium">正在解析文档...</p>
                  <div className="w-64">
                    <Progress value={parseProgress} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">{parseProgress}%</p>
                  </div>
                </div>
              </div>
            )}

            {parseStatus === 'success' && parseResult && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium text-green-700">解析完成！</p>
                  <p className="text-sm text-gray-500">
                    识别到 {parseResult.totalChapters} 个章节
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setPreviewMode('preview')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    查看章节预览
                  </Button>
                </div>
              </div>
            )}

            {parseStatus === 'error' && (
              <div className="text-center space-y-4">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <div>
                  <p className="font-medium text-red-700">解析失败</p>
                  <p className="text-sm text-red-600">{error}</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => {
                      setParseStatus('idle');
                      setError(null);
                      setParseProgress(0);
                    }}
                  >
                    重新解析
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {previewMode === 'preview' && parseResult && (
        <ChapterPreview
          parseResult={parseResult}
          onEditChapter={handleEditChapter}
          onConfirm={handleConfirm}
          onBack={() => setPreviewMode('settings')}
        />
      )}
    </div>
  );
};

export default TxtParseStep;