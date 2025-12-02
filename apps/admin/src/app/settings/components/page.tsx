'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatCard } from '@/components/stat-card';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { ViewToggle } from '@/components/view-toggle';
import { SearchBar } from '@/components/search-bar';
import { ContentCard } from '@/components/data-display/content-card';
import { DetailNavBar } from '@/components/navigation/detail-nav-bar';
import { StandardContainer } from '@/components/standard-container';
import {
    LayoutGrid,
    List,
    Search,
    MoreHorizontal,
    BookOpen,
    Image as ImageIcon,
    Eye,
    Heart,
    Home,
    ChevronLeft,
    Filter,
    Plus,
    FileText,
    Film,
    Info,
    CheckCircle,
    Settings
} from 'lucide-react';

export default function ComponentsShowcasePage() {
    const [count, setCount] = useState(1234);
    const [fullPage, setFullPage] = useState(1);
    const [fullPageSize, setFullPageSize] = useState(20);
    const [compactPage, setCompactPage] = useState(3);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">组件展示</h1>
                <p className="text-sm text-muted-foreground mt-2">
                    查看系统中所有可用的 UI 组件和视觉元素
                </p>
            </div>

            <Separator />

            {/* Foundational Components (shadcn/ui) */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-semibold mb-1">基础组件</h2>
                    <p className="text-sm text-muted-foreground">来自 shadcn/ui - 通用且可复用的基础 UI 元素</p>
                </div>

                {/* Buttons */}
                <Card>
                    <CardHeader>
                        <CardTitle>Button 按钮</CardTitle>
                        <CardDescription>多种变体和尺寸的按钮组件</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button variant="default">Default</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                        </div>
                        <Separator />
                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="default">Default</Button>
                            <Button size="sm">Small</Button>
                            <Button size="lg">Large</Button>
                            <Button size="icon"><Settings className="h-4 w-4" /></Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Badges */}
                <Card>
                    <CardHeader>
                        <CardTitle>Badge 徽章</CardTitle>
                        <CardDescription>用于标记状态和标签的小型组件</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="default">Default</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="destructive">Destructive</Badge>
                            <Badge variant="outline">Outline</Badge>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator />

            {/* Standard Components */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-semibold mb-1">标准化组件</h2>
                    <p className="text-sm text-muted-foreground">项目特定的可复用标准组件 - Phase 1 已完成</p>
                </div>

                {/* StatCard */}
                <Card>
                    <CardHeader>
                        <CardTitle>StatCard 统计卡片</CardTitle>
                        <CardDescription>用于展示统计数据的卡片，包含大图标背景和渐变</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground mb-3">
                            <code className="px-2 py-1 bg-muted rounded">components/stat-card.tsx</code>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="书籍数量"
                                value={count}
                                icon={BookOpen}
                                gradient="from-blue-500/10 to-blue-500/5"
                            />
                            <StatCard
                                title="章节目录"
                                value={5678}
                                icon={List}
                                gradient="from-green-500/10 to-green-500/5"
                            />
                            <StatCard
                                title="正文内容"
                                value={9012}
                                icon={FileText}
                                gradient="from-purple-500/10 to-purple-500/5"
                            />
                            <StatCard
                                title="剧集脚本"
                                value={3456}
                                icon={Film}
                                gradient="from-orange-500/10 to-orange-500/5"
                            />
                        </div>
                        <div className="mt-4">
                            <Button
                                size="sm"
                                onClick={() => setCount(count + Math.floor(Math.random() * 100))}
                            >
                                测试动画效果
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* PageHeader */}
                <Card>
                    <CardHeader>
                        <CardTitle>PageHeader 页面标题</CardTitle>
                        <CardDescription>统一的页面标题组件，支持副标题、操作按钮、返回按钮</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-xs text-muted-foreground mb-2">
                            <code className="px-2 py-1 bg-muted rounded">components/layout/page-header.tsx</code>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-3">示例：基础使用</p>
                            <div className="p-3 bg-background rounded border">
                                <h1 className="text-3xl font-bold tracking-tight">书籍管理</h1>
                                <p className="text-sm text-muted-foreground mt-2">
                                    管理和查看所有书籍、章节和相关内容
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ViewToggle */}
                <Card>
                    <CardHeader>
                        <CardTitle>ViewToggle 视图切换</CardTitle>
                        <CardDescription>在网格视图和列表视图之间切换</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-xs text-muted-foreground mb-2">
                            <code className="px-2 py-1 bg-muted rounded">components/navigation/view-toggle.tsx</code>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-3">默认模式</p>
                            <div className="p-3 bg-background rounded border flex gap-2 justify-center">
                                <Button variant="default" size="icon">
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                    <BookOpen className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SearchBar */}
                <Card>
                    <CardHeader>
                        <CardTitle>SearchBar 搜索栏</CardTitle>
                        <CardDescription>统一的搜索组件，支持防抖、清除、自定义宽度</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-xs text-muted-foreground mb-2">
                            <code className="px-2 py-1 bg-muted rounded">components/forms/search-bar.tsx</code>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-3">基础搜索栏（带防抖）</p>
                            <div className="p-3 bg-background rounded border">
                                <div className="relative max-w-sm mx-auto">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="搜索..." className="pl-9" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pagination 分页</CardTitle>
                        <CardDescription>统一的分页组件，支持完整模式和极简模式。自带顶部分割线。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-xs text-muted-foreground mb-2">
                            <code className="px-2 py-1 bg-muted rounded">components/pagination.tsx</code>
                        </div>

                        {/* Full Mode */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium">完整模式 (Full Mode)</p>
                            <p className="text-xs text-muted-foreground">包含总数、每页数量选择器、页码导航、跳转输入框。自带顶部分割线和内边距。</p>
                            <div className="p-4 border rounded-lg bg-muted/30">
                                <div className="bg-background rounded">
                                    <Pagination
                                        total={500}
                                        page={fullPage}
                                        pageSize={fullPageSize}
                                        onPageChange={setFullPage}
                                        onPageSizeChange={setFullPageSize}
                                        pageSizeOptions={[10, 20, 30, 50]}
                                        variant="full"
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <code className="px-2 py-1 bg-muted rounded text-xs">
                                    {`<Pagination total={500} page={${fullPage}} pageSize={${fullPageSize}} variant="full" />`}
                                </code>
                            </div>
                        </div>

                        <Separator />

                        {/* Compact Mode */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium">极简模式 (Compact Mode)</p>
                            <p className="text-xs text-muted-foreground">仅显示页码导航，适用于空间有限的场景。同样自带顶部分割线。</p>
                            <div className="p-4 border rounded-lg bg-muted/30">
                                <div className="bg-background rounded">
                                    <Pagination
                                        total={200}
                                        page={compactPage}
                                        pageSize={20}
                                        onPageChange={setCompactPage}
                                        variant="compact"
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <code className="px-2 py-1 bg-muted rounded text-xs">
                                    {`<Pagination total={200} page={${compactPage}} pageSize={20} variant="compact" />`}
                                </code>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* DetailNavBar */}
                <Card>
                    <CardHeader>
                        <CardTitle>DetailNavBar 详情页导航栏</CardTitle>
                        <CardDescription>用于详情页的标准化导航工具栏，包含返回按钮和上一项/列表/下一项导航</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-xs text-muted-foreground mb-2">
                            <code className="px-2 py-1 bg-muted rounded">components/navigation/detail-nav-bar.tsx</code>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-medium">书籍详情页示例</p>
                            <p className="text-xs text-muted-foreground">左侧返回首页，右侧上一本/所有书籍/下一本</p>
                            <div className="p-4 border rounded-lg bg-muted/30">
                                <DetailNavBar
                                    backButton={{
                                        href: "/",
                                        label: "返回首页",
                                        icon: <Home className="h-4 w-4" />
                                    }}
                                    navigation={{
                                        prevHref: "/books/1",
                                        prevLabel: "上一本",
                                        listHref: "/?status=all",
                                        listLabel: "所有书籍",
                                        listIcon: <BookOpen className="h-4 w-4" />,
                                        nextHref: "/books/3",
                                        nextLabel: "下一本"
                                    }}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <p className="text-sm font-medium">禁用状态示例</p>
                            <p className="text-xs text-muted-foreground">当没有上一项或下一项时，按钮自动禁用</p>
                            <div className="p-4 border rounded-lg bg-muted/30">
                                <DetailNavBar
                                    backButton={{
                                        href: "/albums/studios",
                                        label: "返回列表",
                                        icon: <ChevronLeft className="h-4 w-4" />
                                    }}
                                    navigation={{
                                        prevHref: null,
                                        prevLabel: "上一个",
                                        listHref: "/albums/studios",
                                        listLabel: "所有机构",
                                        listIcon: <List className="h-4 w-4" />,
                                        nextHref: null,
                                        nextLabel: "下一个"
                                    }}
                                />
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground mt-4">
                            <p className="font-medium mb-2">使用示例：</p>
                            <code className="px-2 py-1 bg-muted rounded text-xs block whitespace-pre">
                                {`<DetailNavBar
  backButton={{
    href: "/",
    label: "返回首页",
    icon: <Home className="h-4 w-4" />
  }}
  navigation={{
    prevHref: prevItem?.id ? \`/items/\${prevItem.id}\` : null,
    prevLabel: "上一项",
    listHref: "/items",
    listLabel: "所有项目",
    listIcon: <List className="h-4 w-4" />,
    nextHref: nextItem?.id ? \`/items/\${nextItem.id}\` : null,
    nextLabel: "下一项"
  }}
/>`}
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator />

            {/* Component Status Summary */}
            <section>
                <Card>
                    <CardHeader>
                        <CardTitle>组件状态总结</CardTitle>
                        <CardDescription>当前设计系统的完整度</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <h3 className="font-semibold">基础组件</h3>
                                </div>
                                <p className="text-2xl font-bold mb-1">15</p>
                                <p className="text-sm text-muted-foreground">
                                    来自 shadcn/ui，已标准化
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-blue-500" />
                                    <h3 className="font-semibold">标准化组件</h3>
                                </div>
                                <p className="text-2xl font-bold mb-1">5</p>
                                <p className="text-sm text-muted-foreground">
                                    StatCard, PageHeader, ViewToggle, SearchBar, Pagination
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-5 w-5 text-orange-500" />
                                    <h3 className="font-semibold">Phase 2 计划</h3>
                                </div>
                                <p className="text-2xl font-bold mb-1">3+</p>
                                <p className="text-sm text-muted-foreground">
                                    Toolbar, DataTable, EmptyState 等
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Data Display Components */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-semibold mb-1">数据展示组件</h2>
                    <p className="text-sm text-muted-foreground">用于展示统计数据、内容列表等</p>
                </div>

                {/* StatCard */}
                <Card>
                    <CardHeader>
                        <CardTitle>StatCard 统计卡片</CardTitle>
                        <CardDescription>用于展示关键指标和统计数据</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="总收入"
                                value="¥128,430"
                                icon={Info}
                                gradient="from-blue-500/10 to-blue-500/5"
                            />
                            <StatCard
                                title="活跃用户"
                                value="2,345"
                                icon={CheckCircle}
                                gradient="from-green-500/10 to-green-500/5"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ContentCard */}
                <Card>
                    <CardHeader>
                        <CardTitle>ContentCard 内容卡片</CardTitle>
                        <CardDescription>用于展示图册、书籍、视频等内容项</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Portrait (Default) */}
                            <div>
                                <h3 className="text-sm font-medium mb-4">Portrait (默认 - 书籍/图册)</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    <ContentCard
                                        title="示例图册标题"
                                        image={null}
                                        href="#"
                                        subtitle={
                                            <span className="flex items-center gap-1">
                                                <span>示例机构</span>
                                                <span>•</span>
                                                <span>示例模特</span>
                                            </span>
                                        }
                                        overlay={
                                            <Badge className="absolute right-2 top-2" variant="secondary">
                                                NEW
                                            </Badge>
                                        }
                                    />
                                    <ContentCard
                                        title="长标题示例：这是一个非常非常长的标题可能会被截断"
                                        image={null}
                                        href="#"
                                        subtitle="副标题也会被截断如果它太长的话，限制为两行显示"
                                    />
                                </div>
                            </div>

                            {/* Square */}
                            <div>
                                <h3 className="text-sm font-medium mb-4">Square (正方形 - 头像/图标)</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    <ContentCard
                                        title="正方形卡片"
                                        image={null}
                                        href="#"
                                        aspectRatio="square"
                                        subtitle="1200 x 1200"
                                    />
                                </div>
                            </div>

                            {/* Video */}
                            <div>
                                <h3 className="text-sm font-medium mb-4">Video (16:9 - 视频/剧集)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <ContentCard
                                        title="示例视频标题"
                                        image={null}
                                        href="#"
                                        aspectRatio="video"
                                        subtitle="2023-10-24 • 12:30"
                                        overlay={
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                <div className="bg-background/80 rounded-full p-2">
                                                    <Film className="h-6 w-6" />
                                                </div>
                                            </div>
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* StandardContainer */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-semibold mb-1">Standard Container</h2>
                    <p className="text-sm text-muted-foreground">
                        标准内容容器，包含头部工具栏（标题、搜索、视图切换）和内容区域。
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <p className="text-sm font-medium">完整示例</p>
                        <StandardContainer
                            title="图册列表"
                            actionLeft={
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    筛选
                                </Button>
                            }
                            search={{
                                value: "",
                                onChange: () => { },
                                onSearch: () => { },
                                placeholder: "搜索图册..."
                            }}
                            viewToggle={{
                                view: "grid",
                                onViewChange: () => { }
                            }}
                            actionsRight={
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    新建图册
                                </Button>
                            }
                        >
                            <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                                容器内容区域
                            </div>
                        </StandardContainer>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-medium">仅标题和右侧操作</p>
                        <StandardContainer
                            title="系统设置"
                            actionsRight={
                                <Button size="sm" className="gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    保存更改
                                </Button>
                            }
                        >
                            <div className="space-y-4">
                                <div className="h-8 w-1/3 bg-muted rounded" />
                                <div className="h-8 w-1/2 bg-muted rounded" />
                            </div>
                        </StandardContainer>
                    </div>
                </div>
            </section>
        </div>
    );
}
