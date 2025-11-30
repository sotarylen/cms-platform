import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Database, Webhook, Bell, Users, ArrowRight, HardDrive } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">系统设置</h1>
                <p className="text-muted-foreground mt-2">管理系统配置和偏好设置</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Management */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <CardTitle>用户管理</CardTitle>
                        </div>
                        <CardDescription>
                            管理系统用户、角色和权限
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            查看、添加、编辑或删除系统用户。
                        </p>
                        <Button asChild>
                            <Link href="/users">
                                管理用户 <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Storage Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-indigo-600" />
                            <CardTitle>存储配置</CardTitle>
                        </div>
                        <CardDescription>
                            管理图册和媒体资源的存储路径
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            设置本地文件存储路径。
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/settings/storage">
                                配置存储 <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Webhook Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Webhook className="h-5 w-5 text-green-600" />
                            <CardTitle>Webhook 配置</CardTitle>
                        </div>
                        <CardDescription>
                            n8n webhook 和外部集成设置
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            配置用于触发外部工作流的 Webhook URL。
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/settings/webhook">
                                配置 Webhook <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-orange-600" />
                            <CardTitle>通知设置</CardTitle>
                        </div>
                        <CardDescription>
                            系统通知和提醒配置
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            通知功能即将推出。
                        </p>
                        <Button variant="outline" disabled>
                            配置通知
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
