import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlbumCover } from "@/components/album-cover"
import { getDashboardStats } from "@/lib/data/stats"
import { getLatestBooks } from "@/lib/data/books"
import { getLatestAlbums } from "@/lib/data/albums"
import { BookOpen, FileText, Film, List, ArrowRight } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const stats = await getDashboardStats();
    const latestBooks = await getLatestBooks(5);
    const latestAlbums = await getLatestAlbums(5);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
                <p className="text-muted-foreground">
                    欢迎回来！这里是系统概览。
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            书籍总数
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.books}</div>
                        <p className="text-xs text-muted-foreground">
                            平台收录的所有书籍
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            章节目录
                        </CardTitle>
                        <List className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.chapters}</div>
                        <p className="text-xs text-muted-foreground">
                            已收录的章节列表项
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            正文内容
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.contents}</div>
                        <p className="text-xs text-muted-foreground">
                            已爬取的章节正文
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            剧集脚本
                        </CardTitle>
                        <Film className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.scripts}</div>
                        <p className="text-xs text-muted-foreground">
                            生成的短剧脚本数量
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Latest Books */}
                <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>最新书籍</CardTitle>
                            <CardDescription>
                                最近入库的 5 本书籍
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/">
                                查看全部 <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {latestBooks.map((book) => (
                                <div key={book.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <Link href={`/books/${book.id}`} className="font-medium hover:underline">
                                            {book.name}
                                        </Link>
                                        <div className="text-sm text-muted-foreground">
                                            {book.author} • {book.category}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{String(book.status) === '1' ? '连载中' : '已完结'}</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(book.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Latest Albums */}
                <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>最新图册</CardTitle>
                            <CardDescription>
                                最近入库的 5 本图册
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/albums">
                                查看全部 <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {latestAlbums.slice(0, 4).map((album) => (
                                <Link key={album.id} href={`/albums/${album.id}`} className="group block space-y-2">
                                    <div className="overflow-hidden rounded-md border bg-muted aspect-[2/3]">
                                        <AlbumCover
                                            src={album.source_page_url}
                                            alt={album.resource_title_raw}
                                            className="h-full w-full object-cover transition-all group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <h3 className="font-medium leading-none truncate" title={album.resource_title_raw}>
                                            {album.resource_title_raw}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
