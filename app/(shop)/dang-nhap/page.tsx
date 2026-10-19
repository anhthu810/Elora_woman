import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: { next?: string } }) {
  if (await getUser()) redirect(searchParams.next?.startsWith('/') ? searchParams.next : '/tai-khoan');
  return <div className="wrap" style={{ paddingTop: 56 }}><AuthForm mode="login" next={searchParams.next} /></div>;
}
