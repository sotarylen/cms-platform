'use client';

import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface EditDialogProps {
    /**
     * 是否打开弹窗
     */
    isOpen: boolean;

    /**
     * 关闭弹窗的回调
     */
    onClose: () => void;

    /**
     * 弹窗标题
     */
    title: string;

    /**
     * 弹窗内容
     */
    children: ReactNode;

    /**
     * 提交表单的回调
     */
    onSubmit: (e: React.FormEvent) => void | Promise<void>;

    /**
     * 是否正在加载/提交
     */
    loading?: boolean;

    /**
     * 错误信息（可选）
     */
    error?: string | null;

    /**
     * 确认按钮文本
     * @default "保存"
     */
    confirmText?: string;

    /**
     * 弹窗最大宽度
     * @default "sm:max-w-[425px]"
     */
    maxWidth?: string;

    /**
     * 是否禁用确认按钮
     */
    disableConfirm?: boolean;

    /**
     * 左侧操作按钮（如删除按钮）
     */
    leftActions?: ReactNode;

    /**
     * 右侧额外操作按钮（在保存按钮左侧）
     */
    rightActions?: ReactNode;
}

/**
 * EditDialog 标准编辑弹窗组件
 * 
 * 统一的编辑弹窗，包含标题、描述、表单内容、错误提示和操作按钮
 * 
 * @example
 * ```tsx
 * <EditDialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="编辑用户"
 *   onSubmit={handleSubmit}
 *   loading={loading}
 *   error={error}
 *   leftActions={<Button variant="destructive">删除</Button>}
 * >
 *   <div className="grid gap-4 py-4">
 *     <div className="grid grid-cols-4 items-center gap-4">
 *       <Label htmlFor="name" className="text-right">姓名</Label>
 *       <Input id="name" className="col-span-3" />
 *     </div>
 *   </div>
 * </EditDialog>
 * ```
 */
export function EditDialog({
    isOpen,
    onClose,
    title,
    children,
    onSubmit,
    loading = false,
    error,
    confirmText = '保存',
    maxWidth = 'sm:max-w-[425px]',
    disableConfirm = false,
    leftActions,
    rightActions,
}: EditDialogProps) {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(e);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${maxWidth} bg-background/80 backdrop-blur-sm`}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-md">
                            {error}
                        </div>
                    )}
                    {children}
                    <DialogFooter className="mt-6 flex justify-between sm:justify-between">
                        <div className="flex-1">
                            {leftActions}
                        </div>
                        <div className="flex gap-2">
                            {rightActions}
                            <Button
                                type="submit"
                                disabled={loading || disableConfirm}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        保存中...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        {confirmText}
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
