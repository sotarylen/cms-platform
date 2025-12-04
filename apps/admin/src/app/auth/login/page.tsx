import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { LoginForm } from '@/components/login-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default async function LoginPage() {
    const user = await getSession();

    // If already logged in, redirect to home
    if (user) {
        redirect('/dashboard');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">登录</CardTitle>
                    <CardDescription>
                        登录到 Novel CMS Platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        还没有账号？{" "}
                        <Link href="/auth/register" className="text-primary underline-offset-4 hover:underline">
                            立即注册
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
