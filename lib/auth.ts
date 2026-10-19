import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { get } from './db';

const COOKIE = 'elora_session';
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET || 'elora-dev-secret-change-me');

export type SessionUser = { id: number; name: string; email: string; role: 'customer' | 'admin' };

export async function createSession(u: SessionUser) {
  const token = await new SignJWT({ id: u.id, role: u.role }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key());
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 86400 });
}
export function destroySession() { cookies().delete(COOKIE); }

export async function getUser(): Promise<SessionUser | null> {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    const row = get<any>('SELECT id,name,email,role FROM users WHERE id=?', payload.id);
    return row ? { id: row.id, name: row.name, email: row.email, role: row.role } : null;
  } catch { return null; }
}
export async function requireAdmin() {
  const u = await getUser();
  if (!u || u.role !== 'admin') throw new Error('Không có quyền quản trị.');
  return u;
}
export const hash = (p: string) => bcrypt.hashSync(p, 10);
export const verify = (p: string, h: string) => bcrypt.compareSync(p, h);
