'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

type Props = {
    images: string[];
    initialIndex: number;
    onClose: () => void;
    onSetCover?: (index: number) => void;
};

export function ImageLightbox({ images, initialIndex, onClose, onSetCover }: Props) {
    const [transitionMode, setTransitionMode] = useState<'fade' | 'slide' | 'none'>('fade');
    const [autoPlayInterval, setAutoPlayInterval] = useState(3000);
    const [showSettings, setShowSettings] = useState(false);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');
    const [animClass, setAnimClass] = useState('');
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

        // 触发动画
        if (transitionMode === 'fade') {
            setAnimClass('anim-fade');
        } else if (transitionMode === 'slide') {
            setAnimClass(direction === 'next' ? 'anim-slide-next' : 'anim-slide-prev');
        } else {
            setAnimClass('');
        }

        // 移除动画类以便下次触发
        const timer = setTimeout(() => setAnimClass(''), 400);
        return () => clearTimeout(timer);
    }, [currentIndex, transitionMode, direction]);

    // 自动播放逻辑
    useEffect(() => {
        if (isPlaying) {
            playTimerRef.current = setInterval(() => {
                setDirection('next');
                setCurrentIndex((prev) => (prev + 1) % images.length);
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
    }, [isPlaying, images.length, autoPlayInterval]);

    const handlePrev = useCallback(() => {
        setDirection('prev');
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsPlaying(false); // 手动切换时停止自动播放
    }, [images.length]);

    const handleNext = useCallback(() => {
        setDirection('next');
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsPlaying(false);
    }, [images.length]);

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

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // 点击背景关闭，点击内容不关闭
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // 使用 Portal 渲染到 body
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="image-lightbox"
            onClick={handleBackdropClick}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="lightbox-container">
                {/* 关闭按钮 */}
                <button className="lightbox-close-btn" onClick={onClose} title="关闭 (Esc)">
                    <i className="fas fa-times"></i>
                </button>

                {/* 主图片区域 */}
                <div
                    className="lightbox-image-wrapper"
                    onClick={handleBackdropClick}
                    onWheel={handleWheel}
                >
                    <img
                        key={currentIndex} // 强制重新渲染以触发动画
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1}`}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                        }}
                        className={`lightbox-image ${animClass}`}
                        draggable={false}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                    />
                </div>

                {/* 左右导航按钮 */}
                <button className="lightbox-nav-btn prev" onClick={handlePrev} title="上一张 (←)">
                    <i className="fas fa-chevron-left"></i>
                </button>
                <button className="lightbox-nav-btn next" onClick={handleNext} title="下一张 (→)">
                    <i className="fas fa-chevron-right"></i>
                </button>

                {/* 底部控制栏 */}
                <div className="lightbox-controls">
                    <div className="controls-group">
                        <button onClick={handleZoomOut} title="缩小 (-)">
                            <i className="fas fa-search-minus"></i>
                        </button>
                        <span className="zoom-level">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} title="放大 (+)">
                            <i className="fas fa-search-plus"></i>
                        </button>
                    </div>

                    <div className="controls-group">
                        <button onClick={togglePlay} title={isPlaying ? "暂停 (Space)" : "自动播放 (Space)"}>
                            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                    </div>

                    {onSetCover && (
                        <div className="controls-group">
                            <button
                                onClick={() => onSetCover(currentIndex)}
                                title="设为封面"
                            >
                                <i className="fas fa-image"></i>
                            </button>
                        </div>
                    )}

                    <div className="controls-group">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            title="设置"
                            style={{ color: showSettings ? 'white' : '#ccc' }}
                        >
                            <i className="fas fa-cog"></i>
                        </button>
                    </div>

                    <div className="controls-group info">
                        <span>{currentIndex + 1} / {images.length}</span>
                    </div>

                    {/* 设置面板 */}
                    {showSettings && (
                        <div className="lightbox-settings-popover" onClick={e => e.stopPropagation()}>
                            <div className="settings-row">
                                <label>切换效果</label>
                                <select
                                    value={transitionMode}
                                    onChange={(e) => setTransitionMode(e.target.value as any)}
                                    className="settings-select"
                                >
                                    <option value="fade">淡入淡出</option>
                                    <option value="slide">滑动</option>
                                    <option value="none">无动画</option>
                                </select>
                            </div>
                            <div className="settings-row">
                                <label>自动播放间隔</label>
                                <select
                                    value={autoPlayInterval}
                                    onChange={(e) => setAutoPlayInterval(Number(e.target.value))}
                                    className="settings-select"
                                >
                                    <option value={2000}>2 秒</option>
                                    <option value={3000}>3 秒</option>
                                    <option value={5000}>5 秒</option>
                                    <option value={10000}>10 秒</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
