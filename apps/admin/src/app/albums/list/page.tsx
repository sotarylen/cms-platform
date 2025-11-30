import Link from 'next/link';
import { getAlbums } from '@/lib/data/albums';
import { formatDate } from '@/lib/utils';
import { AlbumListPagination } from '@/components/album-list-pagination';
import { AlbumCover } from '@/components/album-cover';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { LayoutGrid, List as ListIcon, ExternalLink } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function AlbumList({ searchParams }: any) {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const view = resolvedSearchParams.view || 'list';
    const pageSize = Number(resolvedSearchParams.pageSize) || 30;

    const { items, total } = await getAlbums({ page, pageSize });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">图集列表</h2>
                    <p className="text-muted-foreground">
                        浏览和管理所有图集。
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant={view === 'list' ? 'default' : 'outline'}
                        size="icon"
                        asChild
                    >
                        <Link href={`/albums/list?view=list&page=${page}&pageSize=${pageSize}`}>
                            <ListIcon className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant={view === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        asChild
                    >
                        <Link href={`/albums/list?view=grid&page=${page}&pageSize=${pageSize}`}>
                            <LayoutGrid className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {items.map((album) => (
                        <Card key={album.id} className="overflow-hidden group">
                            <Link href={`/albums/${album.id}`}>
                                <div className="aspect-[2/3] overflow-hidden bg-muted relative">
                                    <AlbumCover
                                        src={album.source_page_url || ''}
                                        alt={album.resource_title_raw}
                                        className="h-full w-full object-cover transition-all group-hover:scale-105"
                                    />
                                    {album.model_name && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs truncate">
                                            {album.model_name}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <CardContent className="p-3 space-y-1">
                                <h3 className="font-medium text-sm truncate" title={album.resource_title_raw}>
                                    <Link href={`/albums/${album.id}`} className="hover:underline">
                                        {album.resource_title_raw}
                                    </Link>
                                </h3>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    {album.studio_id && album.studio_name ? (
                                        <Link href={`/albums/studios/${album.studio_id}`} className="hover:text-foreground truncate max-w-[100px]">
                                            {album.studio_name}
                                        </Link>
                                    ) : (
                                        <span className="truncate max-w-[100px]">{album.studio_name || '—'}</span>
                                    )}
                                    <span>{formatDate(album.created_at)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[60px]">封面</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">标题</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">机构</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">模特</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">创建时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((album) => (
                                <tr key={album.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-mono text-xs text-muted-foreground">
                                        #{album.id}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="h-10 w-8 overflow-hidden rounded bg-muted">
                                            <AlbumCover
                                                src={album.source_page_url || ''}
                                                alt="Cover"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col space-y-1">
                                            <Link href={`/albums/${album.id}`} className="font-medium hover:underline truncate max-w-[300px]">
                                                {album.resource_title_raw}
                                            </Link>
                                            <a
                                                href={album.resource_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                原文链接 <ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        {album.studio_id && album.studio_name ? (
                                            <Link href={`/albums/studios/${album.studio_id}`} className="hover:underline">
                                                {album.studio_name}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">{album.studio_name || '—'}</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle">
                                        {album.model_name ? (
                                            <Badge variant="secondary">{album.model_name}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground">
                                        {formatDate(album.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4">
                <AlbumListPagination
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    view={view}
                />
            </div>
        </div>
    );
}
