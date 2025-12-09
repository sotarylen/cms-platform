'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import TxtUploadStep from './txt-upload-step';
import TxtParseStep from './txt-parse-step';
import TxtImportStep from './txt-import-step';

interface TxtUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (bookId: number) => void;
}

export type UploadStep = 'upload' | 'parse' | 'import';

export interface UploadFileInfo {
  filename: string;
  size: number;
  content?: string;
  contentLength?: number;
}

export interface ParseResult {
  bookTitle: string;
  author: string;
  totalChapters: number;
  chapters: {
    title: string;
    content: string;
    sortOrder: number;
  }[];
  summary: string;
}

const TxtUploadDialog: React.FC<TxtUploadDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');
  const [uploadFile, setUploadFile] = useState<UploadFileInfo | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUploaded = useCallback((fileInfo: UploadFileInfo) => {
    setUploadFile(fileInfo);
    setCurrentStep('parse');
  }, []);

  const handleParseCompleted = useCallback((result: ParseResult) => {
    setParseResult(result);
    setCurrentStep('import');
  }, []);

  const handleImportCompleted = useCallback((bookId: number) => {
    if (onSuccess) {
      onSuccess(bookId);
    }
    handleClose();
  }, [onSuccess]);

  const handleClose = useCallback(() => {
    setCurrentStep('upload');
    setUploadFile(null);
    setParseResult(null);
    setIsLoading(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleBack = useCallback(() => {
    if (currentStep === 'parse') {
      setCurrentStep('upload');
      setUploadFile(null);
    } else if (currentStep === 'import') {
      setCurrentStep('parse');
      setParseResult(null);
    }
  }, [currentStep]);

  const getStepIcon = (step: UploadStep) => {
    const isActive = step === currentStep;
    const isCompleted = (step === 'upload' && uploadFile) || 
                       (step === 'parse' && parseResult) ||
                       (step === 'import' && false); // import step doesn't mark as completed until success

    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (isActive) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    } else {
      return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepTitle = (step: UploadStep) => {
    switch (step) {
      case 'upload':
        return '上传文件';
      case 'parse':
        return '解析内容';
      case 'import':
        return '导入书籍';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            导入TXT文档
          </DialogTitle>
        </DialogHeader>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center py-4 border-b">
          {(['upload', 'parse', 'import'] as UploadStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                {getStepIcon(step)}
                <span className={`text-sm ${step === currentStep ? 'font-medium' : 'text-gray-500'}`}>
                  {getStepTitle(step)}
                </span>
              </div>
              {index < 2 && (
                <div className={`w-8 h-px mx-4 ${
                  ['upload', 'parse'].includes(currentStep) || 
                  (step === 'upload' && uploadFile) ||
                  (step === 'parse' && parseResult)
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* 步骤内容 */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 'upload' && (
            <TxtUploadStep
              onFileUploaded={handleFileUploaded}
              onLoadingChange={setIsLoading}
            />
          )}

          {currentStep === 'parse' && uploadFile && (
            <TxtParseStep
              fileInfo={uploadFile}
              onParseCompleted={handleParseCompleted}
              onBack={handleBack}
              onLoadingChange={setIsLoading}
            />
          )}

          {currentStep === 'import' && parseResult && (
            <TxtImportStep
              parseResult={parseResult}
              originalFilename={uploadFile?.filename || ''}
              onImportCompleted={handleImportCompleted}
              onBack={handleBack}
              onLoadingChange={setIsLoading}
            />
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {uploadFile && (
              <span>已选择: {uploadFile.filename} ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep !== 'upload' && (
              <Button variant="outline" onClick={handleBack}>
                上一步
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TxtUploadDialog;