import Link from 'next/link';
import { getSession } from '@/lib/session';
import { HeaderClient } from './header-client';

export async function AppHeader() {
    const user = await getSession();

    return <HeaderClient user={user} />;
}
