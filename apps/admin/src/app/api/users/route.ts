import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/auth';
import { requireAdmin } from '@/lib/session';

export async function GET() {
    try {
        await requireAdmin();
        const users = await getAllUsers();
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message ?? 'Unauthorized' },
            { status: error?.message === 'Unauthorized' ? 401 : 500 }
        );
    }
}
