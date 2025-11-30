'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Moon,
  Book,
  Sun,
  Leaf,
  Droplet,
  Star,
  SunMoon,
  ChevronLeft,
  ChevronRight,
  List
} from 'lucide-react';

const MIN_SIZE = 16;
const MAX_SIZE = 32;
const STEP = 1;

// 本地存储的键名常量
const FONT_SIZE_KEY = 'reader-font-size';
const BACKGROUND_COLOR_KEY = 'reader-background-color';
const FONT_FAMILY_KEY = 'reader-font-family';

// 支持的字体选项
const FONT_FAMILIES = [
  { value: '', label: '默认字体' },
  { value: 'SimSun, Songti SC, serif', label: '宋体' },
  { value: 'SimHei, Heiti SC, sans-serif', label: '黑体' },
  { value: 'KaiTi, Kaiti SC, cursive', label: '楷体' },
  { value: 'FangSong, Fangsong SC, serif', label: '仿宋' },
  { value: 'Microsoft YaHei, PingFang SC, sans-serif', label: '微软雅黑' },
  { value: 'STHeiti, Heiti TC, sans-serif', label: '华文黑体' },
];

type Props = {
  content: string;
  prevChapterHref?: string;
  nextChapterHref?: string;
  bookHref: string;
  prevChapterTitle?: string;
  nextChapterTitle?: string;
};

export function ChapterContentViewer({
  content,
  prevChapterHref,
  nextChapterHref,
  bookHref,
  prevChapterTitle,
  nextChapterTitle
}: Props) {
  // 使用默认值初始化状态，避免服务端和客户端初始值不一致导致hydration错误
  const [fontSize, setFontSize] = useState<number>(22);
  const [bgColor, setBgColor] = useState<string>('dark');
  const [fontFamily, setFontFamily] = useState<string>('');
  const [loaded, setLoaded] = useState<boolean>(false);

  // 在hydration完成后从localStorage加载用户设置
  useEffect(() => {
    const loadSettings = () => {
      if (typeof window !== 'undefined') {
        const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
        const savedBgColor = localStorage.getItem(BACKGROUND_COLOR_KEY);
        const savedFontFamily = localStorage.getItem(FONT_FAMILY_KEY);

        // 只有当本地存储中有值时才更新状态，否则保持默认状态
        if (savedFontSize !== null) {
          setFontSize(parseInt(savedFontSize, 10));
        }

        if (savedBgColor !== null) {
          setBgColor(savedBgColor);
        }

        // 确保即使 savedFontFamily 为 '' 也更新状态
        if (savedFontFamily !== null) {
          setFontFamily(savedFontFamily);
        }
      }
    };

    loadSettings();
    setLoaded(true);

    // 监听storage事件，当其他标签页更改设置时同步更新
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FONT_SIZE_KEY && e.newValue !== null) {
        setFontSize(parseInt(e.newValue, 10));
      } else if (e.key === BACKGROUND_COLOR_KEY && e.newValue !== null) {
        setBgColor(e.newValue);
      } else if (e.key === FONT_FAMILY_KEY && e.newValue !== null) {
        setFontFamily(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // 保持空依赖数组，只在组件挂载时执行

  // 当组件属性变化时（如切换章节），重新加载设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
      const savedBgColor = localStorage.getItem(BACKGROUND_COLOR_KEY);
      const savedFontFamily = localStorage.getItem(FONT_FAMILY_KEY);

      // 只有当本地存储中有值时才更新状态，否则保持当前状态
      if (savedFontSize !== null) {
        setFontSize(parseInt(savedFontSize, 10));
      }

      if (savedBgColor !== null) {
        setBgColor(savedBgColor);
      }

      // 字体设置也遵循同样的规则，确保即使为 '' 也更新
      if (savedFontFamily !== null) {
        setFontFamily(savedFontFamily);
      }
    }
  }, [content, prevChapterHref, nextChapterHref]); // 当这些属性变化时重新加载设置

  // 当字号变化时，保存到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined' && loaded) {
      localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
    }
  }, [fontSize, loaded]);

  // 当背景色变化时，保存到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined' && loaded) {
      localStorage.setItem(BACKGROUND_COLOR_KEY, bgColor);
    }
  }, [bgColor, loaded]);

  // 当字体变化时，保存到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined' && loaded) {
      localStorage.setItem(FONT_FAMILY_KEY, fontFamily);
    }
  }, [fontFamily, loaded]);

  const setSize = (size: number) => {
    const clamped = Math.min(MAX_SIZE, Math.max(MIN_SIZE, size));
    setFontSize(clamped);
  };

  const setBackground = (color: string) => {
    setBgColor(color);
  };

  const setFont = (family: string) => {
    setFontFamily(family);
  };

  return (
    <div className="reader">
      <div className="reader-toolbar">
        <div className="px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
          <div className="reader-toolbar-group">
            <div className="reader-toolbar-buttons">
              <button
                type="button"
                onClick={() => setSize(fontSize - STEP)}
                disabled={fontSize <= MIN_SIZE}
                title="减小字号"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="reader-toolbar-label">{fontSize}px</span>
              <button
                type="button"
                onClick={() => setSize(fontSize + STEP)}
                disabled={fontSize >= MAX_SIZE}
                title="增大字号"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="reader-toolbar-group">
            <span className="reader-toolbar-label">选择字体</span>
            <select
              className="font-select"
              value={fontFamily}
              onChange={(e) => setFont(e.target.value)}
              title="选择字体"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className="reader-toolbar-group">
            <div className="reader-toolbar-buttons">
              <button
                type="button"
                className={bgColor === 'dark' ? 'active' : ''}
                onClick={() => setBackground('dark')}
                title="深色背景"
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'sepia' ? 'active' : ''}
                onClick={() => setBackground('sepia')}
                title="复古背景"
              >
                <Book className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'light' ? 'active' : ''}
                onClick={() => setBackground('light')}
                title="浅色背景"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'green' ? 'active' : ''}
                onClick={() => setBackground('green')}
                title="绿色背景"
              >
                <Leaf className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'blue' ? 'active' : ''}
                onClick={() => setBackground('blue')}
                title="蓝色背景"
              >
                <Droplet className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'night' ? 'active' : ''}
                onClick={() => setBackground('night')}
                title="夜间背景"
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'contrast' ? 'active' : ''}
                onClick={() => setBackground('contrast')}
                title="高对比度"
              >
                <SunMoon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="reader-toolbar-group">
            {prevChapterHref ? (
              <Link href={prevChapterHref as any} className="action-button" title={prevChapterTitle || "上一章"}>
                <ChevronLeft className="h-4 w-4" /> 上一章
              </Link>
            ) : (
              <span className="action-button disabled">
                <ChevronLeft className="h-4 w-4" /> 上一章
              </span>
            )}
            <Link href={bookHref as any} className="action-button">
              <List className="h-4 w-4" /> 返回目录
            </Link>
            {nextChapterHref ? (
              <Link href={nextChapterHref as any} className="action-button" title={nextChapterTitle || "下一章"}>
                下一章 <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="action-button disabled">
                下一章 <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </div>
      <article
        className={`reader-article ${bgColor}`}
        style={{
          fontSize,
          lineHeight: 1.85,
          fontFamily: fontFamily || undefined,
        }}
      >
        {content}
      </article>
      <div className="reader-toolbar reader-toolbar-bottom">
        <div className="px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
          <div className="reader-toolbar-group">
            <div className="reader-toolbar-buttons">
              <button
                type="button"
                onClick={() => setSize(fontSize - STEP)}
                disabled={fontSize <= MIN_SIZE}
                title="减小字号"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="reader-toolbar-label">{fontSize}px</span>
              <button
                type="button"
                onClick={() => setSize(fontSize + STEP)}
                disabled={fontSize >= MAX_SIZE}
                title="增大字号"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="reader-toolbar-group">
            <select
              className="font-select"
              value={fontFamily}
              onChange={(e) => setFont(e.target.value)}
              title="选择字体"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className="reader-toolbar-group">
            <div className="reader-toolbar-buttons">
              <button
                type="button"
                className={bgColor === 'dark' ? 'active' : ''}
                onClick={() => setBackground('dark')}
                title="深色背景"
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'sepia' ? 'active' : ''}
                onClick={() => setBackground('sepia')}
                title="复古背景"
              >
                <Book className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'light' ? 'active' : ''}
                onClick={() => setBackground('light')}
                title="浅色背景"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'green' ? 'active' : ''}
                onClick={() => setBackground('green')}
                title="绿色背景"
              >
                <Leaf className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'blue' ? 'active' : ''}
                onClick={() => setBackground('blue')}
                title="蓝色背景"
              >
                <Droplet className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'night' ? 'active' : ''}
                onClick={() => setBackground('night')}
                title="夜间背景"
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={bgColor === 'contrast' ? 'active' : ''}
                onClick={() => setBackground('contrast')}
                title="高对比度"
              >
                <SunMoon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="reader-toolbar-group">
            {prevChapterHref ? (
              <Link href={prevChapterHref as any} className="action-button" title={prevChapterTitle || "上一章"}>
                <ChevronLeft className="h-4 w-4" /> 上一章
              </Link>
            ) : (
              <span className="action-button disabled">
                <ChevronLeft className="h-4 w-4" /> 上一章
              </span>
            )}
            <Link href={bookHref as any} className="action-button">
              <List className="h-4 w-4" /> 返回目录
            </Link>
            {nextChapterHref ? (
              <Link href={nextChapterHref as any} className="action-button" title={nextChapterTitle || "下一章"}>
                下一章 <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="action-button disabled">
                下一章 <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}