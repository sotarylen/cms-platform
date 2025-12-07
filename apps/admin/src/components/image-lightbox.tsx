'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Play,
    Pause,
    Settings,
    Image as ImageIcon,
    Trash2,
    RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Props = {
    images: string[];
    initialIndex: number;
    onClose: () => void;
    onSetCover?: (index: number) => void;
    onDelete?: (index: number) => void;
    albumId?: number;
    imageFilenames?: string[];
};

export function ImageLightbox({ images, initialIndex, onClose, onSetCover, onDelete, albumId, imageFilenames }: Props) {
    const [transitionMode, setTransitionMode] = useState<'fade' | 'slide' | 'combined' | 'none'>('combined');
    const [autoPlayInterval, setAutoPlayInterval] = useState(3000);
    const [showSettings, setShowSettings] = useState(false);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');
    const [exitingIndex, setExitingIndex] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState<Record<number, number>>({});

    // 确保索引有效
    useEffect(() => {
        if (initialIndex >= 0 && initialIndex < images.length) {
            setCurrentIndex(initialIndex);
        }
    }, [initialIndex, images.length]);

    // 重置缩放和位置当图片改变时
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        // Rotation persists across image changes
    }, [currentIndex]);

    // 动画清理
    useEffect(() => {
        if (exitingIndex !== null) {
            const timer = setTimeout(() => {
                setExitingIndex(null);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [exitingIndex]);

    const handlePrev = useCallback((stopAutoplay = true) => {
        setDirection('prev');
        setExitingIndex(currentIndex);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        if (stopAutoplay) setIsPlaying(false);
    }, [currentIndex, images.length]);

    const handleNext = useCallback((stopAutoplay = true) => {
        setDirection('next');
        setExitingIndex(currentIndex);
        setCurrentIndex((prev) => (prev + 1) % images.length);
        if (stopAutoplay) setIsPlaying(false);
    }, [currentIndex, images.length]);

    // 自动播放逻辑
    useEffect(() => {
        if (isPlaying) {
            playTimerRef.current = setInterval(() => {
                handleNext(false);
            }, autoPlayInterval);
        } else {
            if (playTimerRef.current) {
                clearInterval(playTimerRef.current);
                playTimerRef.current = null;
            }
        }

        return () => {
            if (playTimerRef.current) {
                clearInterval(playTimerRef.current);
            }
        };
    }, [isPlaying, images.length, autoPlayInterval, handleNext]);

    const handleZoomIn = useCallback(() => {
        setScale((prev) => Math.min(prev + 0.25, 5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale((prev) => {
            const next = Math.max(prev - 0.25, 0.5);
            if (next <= 1) setPosition({ x: 0, y: 0 });
            return next;
        });
    }, []);

    const togglePlay = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    // 键盘事件处理
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    handlePrev();
                    break;
                case 'ArrowRight':
                    handleNext();
                    break;
                case ' ': // Space bar
                    e.preventDefault();
                    togglePlay();
                    break;
                case '+':
                case '=':
                    handleZoomIn();
                    break;
                case '-':
                case '_':
                    handleZoomOut();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        // 锁定背景滚动
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose, handlePrev, handleNext, togglePlay, handleZoomIn, handleZoomOut]);

    // 滚轮缩放
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.002;
        setScale((prev) => {
            const next = Math.min(Math.max(prev + delta, 0.5), 5);
            if (next <= 1) setPosition({ x: 0, y: 0 });
            return next;
        });
    };

    // 拖拽处理
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleRotate = useCallback(async () => {
        const currentRotation = rotation[currentIndex] || 0;
        const newRotation = (currentRotation + 90) % 360;

        // Update local state
        setRotation(prev => ({
            ...prev,
            [currentIndex]: newRotation
        }));

        // Save to server
        if (albumId && imageFilenames) {
            try {
                const filename = imageFilenames[currentIndex];
                console.log('[Rotate] Saving rotation:', { albumId, filename, rotation: newRotation });

                const response = await fetch('/api/images/rotate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        albumId,
                        filename,
                        rotation: newRotation
                    }),
                });

                const result = await response.json();
                console.log('[Rotate] Server response:', result);

                if (!response.ok) {
                    console.error('[Rotate] Failed to save rotation:', result);
                } else {
                    console.log('[Rotate] Rotation saved successfully');

                    // Force reload the image by adding a cache-busting parameter
                    const currentUrl = images[currentIndex];
                    const separator = currentUrl.includes('?') ? '&' : '?';
                    const newUrl = `${currentUrl}${separator}t=${Date.now()}`;

                    // Update the images array to force re-render
                    const newImages = [...images];
                    newImages[currentIndex] = newUrl;

                    // We need to trigger a re-render by updating the key
                    // This will be handled by the parent component
                    window.location.reload();
                }
            } catch (error) {
                console.error('[Rotate] Error saving rotation:', error);
            }
        } else {
            console.warn('[Rotate] Missing albumId or imageFilenames, rotation not saved');
        }
    }, [currentIndex, rotation, albumId, imageFilenames, images]);

    // 点击背景关闭，点击内容不关闭
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getAnimationClasses = () => {
        if (exitingIndex === null) return { entering: '', exiting: '' };

        if (transitionMode === 'fade') {
            return {
                entering: 'animate-in fade-in duration-1000 ease-in-out fill-mode-forwards',
                exiting: 'animate-out fade-out duration-1000 ease-in-out fill-mode-forwards'
            };
        }
        if (transitionMode === 'slide') {
            if (direction === 'next') {
                return {
                    entering: 'animate-in slide-in-from-right duration-1000 ease-in-out fill-mode-forwards',
                    exiting: 'animate-out slide-out-to-left duration-1000 ease-in-out fill-mode-forwards'
                };
            } else {
                return {
                    entering: 'animate-in slide-in-from-left duration-1000 ease-in-out fill-mode-forwards',
                    exiting: 'animate-out slide-out-to-right duration-1000 ease-in-out fill-mode-forwards'
                };
            }
        }
        if (transitionMode === 'combined') {
            if (direction === 'next') {
                return {
                    entering: 'animate-in slide-in-from-right fade-in zoom-in duration-1000 ease-in-out fill-mode-forwards',
                    exiting: 'animate-out slide-out-to-left fade-out zoom-out duration-1000 ease-in-out fill-mode-forwards'
                };
            } else {
                return {
                    entering: 'animate-in slide-in-from-left fade-in zoom-in duration-1000 ease-in-out fill-mode-forwards',
                    exiting: 'animate-out slide-out-to-right fade-out zoom-out duration-1000 ease-in-out fill-mode-forwards'
                };
            }
        }
        return { entering: '', exiting: '' };
    };

    const { entering: enteringClass, exiting: exitingClass } = getAnimationClasses();

    // 使用 Portal 渲染到 body
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={handleBackdropClick}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* 关闭按钮 */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 hover:text-white"
                    onClick={onClose}
                    title="关闭 (Esc)"
                >
                    <X className="h-6 w-6" />
                </Button>

                {/* 主图片区域 */}
                <div
                    className="relative w-full h-full flex items-center justify-center"
                    onClick={handleBackdropClick}
                    onWheel={handleWheel}
                >
                    {/* 预加载前后图片 */}
                    <div className="hidden">
                        {images[(currentIndex + 1) % images.length] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={images[(currentIndex + 1) % images.length]} alt="preload next" />
                        )}
                        {images[(currentIndex - 1 + images.length) % images.length] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={images[(currentIndex - 1 + images.length) % images.length]} alt="preload prev" />
                        )}
                    </div>

                    {/* Exiting Image (Previous) */}
                    {exitingIndex !== null && (
                        <img
                            key={`exiting-${exitingIndex}`}
                            src={images[exitingIndex]}
                            alt="Exiting"
                            style={{
                                maxHeight: '100vh',
                                maxWidth: '100vw',
                                objectFit: 'contain',
                                position: 'absolute',
                                zIndex: 1
                            }}
                            className={cn("select-none pointer-events-none", exitingClass)}
                            draggable={false}
                        />
                    )}

                    {/* Entering/Current Image */}
                    <img
                        key={currentIndex}
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1}`}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation[currentIndex] || 0}deg)`,
                            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                            maxHeight: '100vh',
                            maxWidth: '100vw',
                            objectFit: 'contain',
                            position: 'absolute',
                            zIndex: 2
                        }}
                        className={cn("select-none", enteringClass)}
                        draggable={false}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                    />
                </div>

                {/* 左右导航按钮 */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 hover:text-white h-12 w-12 rounded-full"
                    onClick={() => handlePrev()}
                    title="上一张 (←)"
                >
                    <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 hover:text-white h-12 w-12 rounded-full"
                    onClick={() => handleNext()}
                    title="下一张 (→)"
                >
                    <ChevronRight className="h-8 w-8" />
                </Button>

                {/* 底部控制栏 */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/50 backdrop-blur rounded-full flex items-center justify-center gap-4 z-50 shadow-lg border border-white/10">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleZoomOut} title="缩小 (-)">
                            <ZoomOut className="h-5 w-5" />
                        </Button>
                        <span className="text-white text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleZoomIn} title="放大 (+)">
                            <ZoomIn className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay} title={isPlaying ? "暂停 (Space)" : "自动播放 (Space)"}>
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={handleRotate}
                            title="旋转 90°"
                        >
                            <RotateCw className="h-5 w-5" />
                        </Button>
                    </div>

                    {onSetCover && (
                        <>
                            <div className="w-px h-6 bg-white/20 mx-2" />
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={() => onSetCover(currentIndex)}
                                    title="设为封面"
                                >
                                    <ImageIcon className="h-5 w-5" />
                                </Button>
                            </div>
                        </>
                    )}

                    {onDelete && (
                        <>
                            <div className="w-px h-6 bg-white/20 mx-2" />
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20 hover:text-red-400"
                                    onClick={() => onDelete(currentIndex)}
                                    title="删除图片"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </>
                    )}

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("text-white hover:bg-white/20", showSettings && "bg-white/20")}
                            onClick={() => setShowSettings(!showSettings)}
                            title="设置"
                        >
                            <Settings className="h-5 w-5" />
                        </Button>

                        {/* 设置面板 */}
                        {showSettings && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-popover text-popover-foreground rounded-md shadow-lg border border-border" onClick={e => e.stopPropagation()}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>切换效果</Label>
                                        <Select
                                            value={transitionMode}
                                            onValueChange={(value: any) => setTransitionMode(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="combined">组合效果</SelectItem>
                                                <SelectItem value="fade">淡入淡出</SelectItem>
                                                <SelectItem value="slide">滑动</SelectItem>
                                                <SelectItem value="none">无动画</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>自动播放间隔</Label>
                                        <Select
                                            value={autoPlayInterval.toString()}
                                            onValueChange={(value) => setAutoPlayInterval(Number(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2000">2 秒</SelectItem>
                                                <SelectItem value="3000">3 秒</SelectItem>
                                                <SelectItem value="5000">5 秒</SelectItem>
                                                <SelectItem value="10000">10 秒</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    <div className="text-white text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
