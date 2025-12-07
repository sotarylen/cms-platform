import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { ContentCard } from "@/components/data-display/content-card"
import { PageHeader } from "@/components/layout/page-header"
import { StandardContainer } from "@/components/standard-container"
import TriggerButton from "@/components/trigger-button"
import { StatusPill } from "@/components/status-pill"
import { getDashboardStats } from "@/lib/data/stats"
import { getLatestBooks } from "@/lib/data/books"
import { getLatestAlbums } from "@/lib/data/albums"
import { formatDate, formatNumber } from "@/lib/utils"
import { BookOpen, FileText, Film, Image as ImageIcon, Building2, ArrowRight } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const stats = await getDashboardStats();
    const latestBooks = await getLatestBooks(5);
    const latestAlbums = await getLatestAlbums(6);

    return (
        <div className="space-y-8">
            <PageHeader
                title="仪表盘"
                subtitle="欢迎回来！这里是系统概览。"
            />

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard
                    title="书籍数"
                    value={stats.books}
                    icon={BookOpen}
                    gradient="from-blue-500/10 to-blue-500/5"
                />
                <StatCard
                    title="章节数"
                    value={stats.contents}
                    icon={FileText}
                    gradient="from-green-500/10 to-green-500/5"
                />
                <StatCard
                    title="剧本数"
                    value={stats.scripts}
                    icon={Film}
                    gradient="from-purple-500/10 to-purple-500/5"
                />
                <StatCard
                    title="图册数"
                    value={stats.albums}
                    icon={ImageIcon}
                    gradient="from-orange-500/10 to-orange-500/5"
                />
                <StatCard
                    title="工作室数"
                    value={stats.studios}
                    icon={Building2}
                    gradient="from-pink-500/10 to-pink-500/5"
                />
            </div>

            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"> */}
            <StandardContainer
                title="最新书籍"
                actionsRight={
                    <Button variant="default" size="sm" asChild>
                        <Link href="/books">
                            查看全部 <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                }
            >
                <div className="rounded-md border">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">书名</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">作者</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">来源</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">章节数</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">状态</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">操作</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">入库时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latestBooks.map((book) => (
                                <tr key={book.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle">
                                        <span className="text-sm font-semibold text-muted-foreground">#{book.id}</span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Link href={`/books/${book.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                                            {book.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 align-middle text-sm">{book.author ?? '未知'}</td>
                                    <td className="p-4 align-middle text-sm">{book.source ?? '—'}</td>
                                    <td className="p-4 align-middle text-sm">{formatNumber(book.chapterCount)}</td>
                                    <td className="p-4 align-middle">
                                        <StatusPill status={book.status} />
                                    </td>
                                    <td className="p-4 align-middle">
                                        {book.status === 0 ? <TriggerButton bookId={book.id} /> : null}
                                    </td>
                                    <td className="p-4 align-middle text-sm text-muted-foreground">
                                        {formatDate(new Date(book.createdAt))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </StandardContainer>
            {/* </div> */}

            {/* Latest Albums */}
            {/* <div className="col-span-3"> */}
            <StandardContainer
                title="最新图册"
                actionsRight={
                    <Button variant="default" size="sm" asChild>
                        <Link href="/albums">
                            查看全部 <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                }
            >
                <div className="grid grid-cols-6 gap-4">
                    {latestAlbums.filter(album => album.id && album.id !== 0).slice(0, 6).map((album) => (
                        <ContentCard
                            key={album.id}
                            title={album.title || album.resource_title_raw}
                            image={album.source_page_url || null}
                            href={`/albums/${album.id}`}
                            subtitle={
                                <div className="flex flex-wrap gap-1">
                                    {album.studio_name && (
                                        <span>{album.studio_name}</span>
                                    )}
                                    {album.studio_name && album.model_name && <span>•</span>}
                                    {album.model_name && (
                                        <span>{album.model_name}</span>
                                    )}
                                </div>
                            }
                        />
                    ))}
                </div>
            </StandardContainer>
            {/* </div> */}
            {/* </div> */}
        </div>
    )
}
