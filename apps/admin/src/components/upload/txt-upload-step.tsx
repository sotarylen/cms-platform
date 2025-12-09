'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import type { UploadFileInfo } from './txt-upload-dialog';

interface TxtUploadStepProps {
  onFileUploaded: (fileInfo: UploadFileInfo) => void;
  onLoadingChange: (loading: boolean) => void;
}

const TxtUploadStep: React.FC<TxtUploadStepProps> = ({
  onFileUploaded,
  onLoadingChange
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.txt')) {
      return '只支持TXT格式文件';
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return '文件大小不能超过10MB';
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploadStatus('uploading');
    setUploadProgress(0);
    onLoadingChange(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload/txt', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }

      const result = await response.json();
      
      setUploadStatus('success');
      
      // 延迟一点时间显示成功状态
      setTimeout(() => {
        onFileUploaded({
          filename: result.filename,
          size: result.size,
          content: result.content,
          contentLength: result.contentLength
        });
      }, 500);

    } catch (err: any) {
      setUploadStatus('error');
      setError(err.message || '上传失败');
      onLoadingChange(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* 上传区域 */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : uploadStatus === 'success'
              ? 'border-green-500 bg-green-50'
              : uploadStatus === 'error'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          {uploadStatus === 'uploading' ? (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
              <div>
                <p className="text-lg font-medium">正在上传文件...</p>
                <div className="mt-4 max-w-md mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
                </div>
              </div>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <p className="text-lg font-medium text-green-700">上传成功！</p>
                <p className="text-sm text-gray-500">正在跳转到解析步骤...</p>
              </div>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <p className="text-lg font-medium text-red-700">上传失败</p>
                <p className="text-sm text-red-600">{error}</p>
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    setUploadStatus('idle');
                    setError(null);
                    setUploadProgress(0);
                  }}
                >
                  重新上传
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileText className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium">拖拽TXT文件到此处</p>
                <p className="text-sm text-gray-500 mt-2">或者点击下方按钮选择文件</p>
                <p className="text-xs text-gray-400 mt-1">支持最大10MB的TXT文件</p>
              </div>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  选择文件
                </label>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">使用说明</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 支持TXT格式的文本文件</li>
          <li>• 文件大小限制：10MB以内</li>
          <li>• 系统将自动识别章节结构（"第X章"、"Chapter X"等格式）</li>
          <li>• 解析后您可以调整章节划分和书籍信息</li>
        </ul>
      </div>
    </div>
  );
};

export default TxtUploadStep;