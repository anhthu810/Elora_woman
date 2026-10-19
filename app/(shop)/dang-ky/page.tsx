import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';
export const dynamic = 'force-dynamic';
export default async function Page() {
  if (await getUser()) redirect('/tai-khoan');
  return <div className="wrap" style={{ paddingTop: 56 }}><AuthForm mode="register" /></div>;
}
