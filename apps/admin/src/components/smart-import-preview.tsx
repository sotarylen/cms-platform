'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    CheckCircle2,
    AlertCircle,
    XCircle,
    Edit3,
    Save,
    SkipForward,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Eye,
    EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

export interface SmartParsedFolderName {
    studio: string;
    model: string;
    title: string;
    confidence: {
        studio: number;
        model: number;
        overall: number;
    };
    method: string;
    valid: boolean;
    error?: string;
}

export interface ParsedFolderItem extends SmartParsedFolderName {
    folderName: string;
    id: string;
    status: 'pending' | 'confirmed' | 'edited' | 'skipped';
}

interface SmartImportPreviewProps {
    folders: string[];
    parsedResults?: SmartParsedFolderName[]; // 可选：预解析结果
    onConfirm: (results: ParsedFolderItem[]) => Promise<void>;
    onCancel: () => void;
}

export function SmartImportPreview({ folders, parsedResults, onConfirm, onCancel }: SmartImportPreviewProps) {
    const [parsedItems, setParsedItems] = useState<ParsedFolderItem[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        high: true,
        medium: false,
        low: false
    });
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ studio: '', model: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    // 初始化解析
    useEffect(() => {
        let items: ParsedFolderItem[];

        if (parsedResults && parsedResults.length > 0) {
            // 使用预解析结果
            items = parsedResults.map((parsed, index) => ({
                ...parsed,
                folderName: folders[index],
                id: `item-${index}`,
                status: 'pending'
            }));
        } else {
            // 如果没有预解析结果，创建基本项目（降级处理）
            items = folders.map((folder, index) => ({
                studio: '',
                model: '',
                title: folder,
                confidence: { studio: 0, model: 0, overall: 0 },
                method: 'unknown',
                valid: false,
                error: '未解析',
                folderName: folder,
                id: `item-${index}`,
                status: 'pending'
            }));
        }

        setParsedItems(items);
    }, [folders, parsedResults]);

    // 分组统计
    const groupedItems = {
        high: parsedItems.filter(item => item.confidence.overall >= 80),
        medium: parsedItems.filter(item => item.confidence.overall >= 50 && item.confidence.overall < 80),
        low: parsedItems.filter(item => item.confidence.overall < 50)
    };

    // 状态统计
    const stats = {
        total: parsedItems.length,
        pending: parsedItems.filter(item => item.status === 'pending').length,
        confirmed: parsedItems.filter(item => item.status === 'confirmed').length,
        edited: parsedItems.filter(item => item.status === 'edited').length,
        skipped: parsedItems.filter(item => item.status === 'skipped').length
    };

    const handleGroupAction = (group: 'high' | 'medium' | 'low', action: 'confirm' | 'skip' | 'edit') => {
        const groupItems = groupedItems[group];

        if (action === 'confirm') {
            setParsedItems(items =>
                items.map(item =>
                    groupItems.find(groupItem => groupItem.id === item.id)
                        ? { ...item, status: 'confirmed' as const }
                        : item
                )
            );
            toast.success(`已确认 ${groupItems.length} 个高置信度项目`);
        } else if (action === 'skip') {
            setParsedItems(items =>
                items.map(item =>
                    groupItems.find(groupItem => groupItem.id === item.id)
                        ? { ...item, status: 'skipped' as const }
                        : item
                )
            );
            toast.info(`已跳过 ${groupItems.length} 个项目`);
        } else if (action === 'edit') {
            // 展开该组以便编辑
            setExpandedGroups(prev => ({ ...prev, [group]: true }));
        }
    };

    const handleItemAction = (id: string, action: 'edit' | 'confirm' | 'skip') => {
        if (action === 'edit') {
            const item = parsedItems.find(item => item.id === id);
            if (item) {
                setEditingItem(id);
                setEditForm({ studio: item.studio, model: item.model });
            }
        } else if (action === 'confirm') {
            setParsedItems(items =>
                items.map(item =>
                    item.id === id ? { ...item, status: 'confirmed' as const } : item
                )
            );
        } else if (action === 'skip') {
            setParsedItems(items =>
                items.map(item =>
                    item.id === id ? { ...item, status: 'skipped' as const } : item
                )
            );
        }
    };

    const handleSaveEdit = (id: string) => {
        setParsedItems(items =>
            items.map(item =>
                item.id === id
                    ? {
                        ...item,
                        studio: editForm.studio,
                        model: editForm.model,
                        status: 'edited' as const,
                        confidence: {
                            ...item.confidence,
                            studio: 95,
                            model: 95,
                            overall: 95
                        }
                    }
                    : item
            )
        );
        setEditingItem(null);
        setEditForm({ studio: '', model: '' });
        toast.success('已保存编辑');
    };

    const handleConfirmAll = async () => {
        const confirmedItems = parsedItems.filter(item =>
            item.status === 'confirmed' || item.status === 'edited'
        );

        if (confirmedItems.length === 0) {
            toast.error('请至少确认一个项目');
            return;
        }

        setIsProcessing(true);
        try {
            await onConfirm(confirmedItems);
            toast.success(`成功导入 ${confirmedItems.length} 个图册`);
        } catch (error) {
            toast.error('导入过程中发生错误');
        } finally {
            setIsProcessing(false);
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-600';
        if (confidence >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceBadge = (confidence: number) => {
        if (confidence >= 80) return <Badge className="bg-green-100 text-green-800">高</Badge>;
        if (confidence >= 50) return <Badge className="bg-yellow-100 text-yellow-800">中</Badge>;
        return <Badge className="bg-red-100 text-red-800">低</Badge>;
    };

    const getStatusIcon = (status: ParsedFolderItem['status']) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'edited':
                return <Edit3 className="h-4 w-4 text-blue-500" />;
            case 'skipped':
                return <XCircle className="h-4 w-4 text-gray-400" />;
            default:
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        }
    };

    const renderGroup = (groupName: 'high' | 'medium' | 'low', items: ParsedFolderItem[]) => {
        const groupNames = {
            high: '高置信度',
            medium: '中等置信度',
            low: '低置信度'
        };

        const groupIcons = {
            high: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            medium: <AlertCircle className="h-5 w-5 text-yellow-500" />,
            low: <XCircle className="h-5 w-5 text-red-500" />
        };

        const isExpanded = expandedGroups[groupName];

        return (
            <Card key={groupName} className="mb-4">
                <CardHeader
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {groupIcons[groupName]}
                            <CardTitle className="text-lg">{groupNames[groupName]}</CardTitle>
                            <Badge variant="secondary">{items.length} 个</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleGroupAction(groupName, 'confirm');
                                }}
                            >
                                全部确认
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleGroupAction(groupName, 'skip');
                                }}
                            >
                                全部跳过
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {isExpanded && (
                    <CardContent>
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getStatusIcon(item.status)}
                                                <span className="font-medium text-sm truncate">
                                                    {item.folderName}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <span className="text-muted-foreground">摄影机构: </span>
                                                    <span className="font-medium">{item.studio || '未识别'}</span>
                                                    {getConfidenceBadge(item.confidence.studio)}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">模特名称: </span>
                                                    <span className="font-medium">{item.model || '未识别'}</span>
                                                    {getConfidenceBadge(item.confidence.model)}
                                                </div>
                                            </div>

                                            <div className="text-xs text-muted-foreground mt-1">
                                                解析方法: {item.method} | 总体置信度:
                                                <span className={getConfidenceColor(item.confidence.overall)}>
                                                    {item.confidence.overall}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 ml-2">
                                            {editingItem === item.id ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSaveEdit(item.id)}
                                                    >
                                                        <Save className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingItem(null)}
                                                    >
                                                        取消
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleItemAction(item.id, 'edit')}
                                                    >
                                                        <Edit3 className="h-3 w-3" />
                                                    </Button>
                                                    {item.status !== 'confirmed' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleItemAction(item.id, 'confirm')}
                                                        >
                                                            确认
                                                        </Button>
                                                    )}
                                                    {item.status !== 'skipped' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleItemAction(item.id, 'skip')}
                                                        >
                                                            <SkipForward className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {editingItem === item.id && (
                                        <>
                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                                <div>
                                                    <Label className="text-xs">摄影机构</Label>
                                                    <Input
                                                        value={editForm.studio}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, studio: e.target.value }))}
                                                        placeholder="输入机构名称"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">模特名称</Label>
                                                    <Input
                                                        value={editForm.model}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, model: e.target.value }))}
                                                        placeholder="输入模特名称"
                                                    />
                                                </div>
                                            </div>

                                            {/* 快速填入区域 */}
                                            <div className="pt-2">
                                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                                    快速填入 (点击片段设为模特)
                                                </Label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.folderName.split(/[\s\[\]\(\)\.\-_]+/).filter(Boolean).map((token, idx) => (
                                                        <Badge
                                                            key={`${idx}-${token}`}
                                                            variant="secondary"
                                                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                                            onClick={() => setEditForm(prev => ({ ...prev, model: token }))}
                                                            title="点击设为模特名称"
                                                        >
                                                            {token}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )
                }
            </Card >
        );
    };

    return (
        <Dialog open={true} onOpenChange={() => onCancel()}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>智能图册导入预览</DialogTitle>
                    <DialogDescription>
                        批量解析了 {stats.total} 个文件夹，请确认解析结果并选择要导入的图册
                    </DialogDescription>
                </DialogHeader>

                {/* 统计概览 */}
                <div className="grid grid-cols-5 gap-4 py-4 border-b">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">总计</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                        <div className="text-xs text-muted-foreground">已确认</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.edited}</div>
                        <div className="text-xs text-muted-foreground">已编辑</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <div className="text-xs text-muted-foreground">待处理</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">{stats.skipped}</div>
                        <div className="text-xs text-muted-foreground">已跳过</div>
                    </div>
                </div>

                {/* 分组展示 */}
                <div className="flex-1 min-h-0 overflow-y-auto p-1">
                    <div className="space-y-4 pr-2">
                        {renderGroup('high', groupedItems.high)}
                        {renderGroup('medium', groupedItems.medium)}
                        {renderGroup('low', groupedItems.low)}
                    </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        已选择 {stats.confirmed + stats.edited} 个图册进行导入
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onCancel}>
                            取消
                        </Button>
                        <Button
                            onClick={handleConfirmAll}
                            disabled={isProcessing || (stats.confirmed + stats.edited) === 0}
                        >
                            {isProcessing ? '导入中...' : `导入 ${stats.confirmed + stats.edited} 个图册`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}