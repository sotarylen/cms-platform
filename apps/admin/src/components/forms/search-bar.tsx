'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
    /**
     * 搜索值
     */
    value: string;

    /**
     * 搜索回调
     */
    onSearch: (value: string) => void;

    /**
     * 提示文本（可选）
     * @default '搜索...'
     */
    placeholder?: string;

    /**
     * 自定义图标（可选）
     * 默认使用 Search 图标
     */
    icon?: React.ReactNode;

    /**
     * 宽度（可选）
     * @default '300px'
     */
    width?: string | number;

    /**
     * 防抖延迟（毫秒）（可选）
     * 设置为 0 禁用防抖
     * @default 300
     */
    debounce?: number;

    /**
     * 是否可清除（可选）
     * @default true
     */
    clearable?: boolean;

    /**
     * 清除回调（可选）
     */
    onClear?: () => void;

    /**
     * 自定义类名（可选）
     */
    className?: string;

    /**
     * 是否显示搜索按钮（可选）
     * @default false
     */
    showButton?: boolean;

    /**
     * 搜索按钮文本（可选）
     * @default '搜索'
     */
    buttonText?: string;
}

/**
 * SearchBar 组件
 * 
 * 标准化的搜索栏组件，支持防抖、清除等功能
 * 
 * @example
 * ```tsx
 * // 基础使用
 * <SearchBar value={query} onSearch={setQuery} />
 * 
 * // 带搜索按钮
 * <SearchBar 
 *   value={query} 
 *   onSearch={handleSearch}
 *   showButton
 *   placeholder="搜索书籍..."
 * />
 * 
 * // 自定义宽度和防抖
 * <SearchBar 
 *   value={query} 
 *   onSearch={setQuery}
 *   width="100%"
 *   debounce={500}
 * />
 * 
 * // 禁用清除按钮
 * <SearchBar 
 *   value={query} 
 *   onSearch={setQuery}
 *   clearable={false}
 * />
 * ```
 */
export function SearchBar({
    value,
    onSearch,
    placeholder = '搜索...',
    icon,
    width = '300px',
    debounce = 300,
    clearable = true,
    onClear,
    className,
    showButton = false,
    buttonText = '搜索',
}: SearchBarProps) {
    const [localValue, setLocalValue] = React.useState(value);
    const debounceTimerRef = React.useRef<NodeJS.Timeout>();

    // 同步外部 value 变化
    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        // 清除之前的定时器
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (debounce > 0) {
            // 设置新的防抖定时器
            debounceTimerRef.current = setTimeout(() => {
                onSearch(newValue);
            }, debounce);
        } else {
            // 无防抖，直接调用
            onSearch(newValue);
        }
    };

    const handleClear = () => {
        setLocalValue('');
        onSearch('');
        onClear?.();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localValue);
    };

    const containerStyle = typeof width === 'number' ? { width: `${width}px` } : { width };

    if (showButton) {
        return (
            <form onSubmit={handleSubmit} className={cn('flex gap-2', className)} style={containerStyle}>
                <div className="relative flex-1">
                    {icon || <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
                    <Input
                        value={localValue}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className={cn('pl-9', clearable && localValue && 'pr-9')}
                    />
                    {clearable && localValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button type="submit">{buttonText}</Button>
            </form>
        );
    }

    return (
        <div className={cn('relative', className)} style={containerStyle}>
            {icon || <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
            <Input
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={cn('pl-9', clearable && localValue && 'pr-9')}
            />
            {clearable && localValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
