'use server';
import { redirect } from 'next/navigation';
import { get, run } from '@/lib/db';
import { createSession, destroySession, hash, verify, getUser } from '@/lib/auth';
import { nowIso } from '@/lib/util';

export type Res = { ok?: boolean; error?: string; msg?: string };
const s = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(_: Res, f: FormData): Promise<Res> {
  const email = s(f, 'email').toLowerCase(), pass = s(f, 'password');
  if (!EMAIL.test(email)) return { error: 'Email chưa đúng định dạng.' };
  if (!pass) return { error: 'Nhập mật khẩu.' };
  const u = get<any>('SELECT * FROM users WHERE email=?', email);
  if (!u || !verify(pass, u.password_hash)) return { error: 'Email hoặc mật khẩu chưa đúng.' };
  await createSession({ id: u.id, name: u.name, email: u.email, role: u.role });
  const next = s(f, 'next');
  redirect(u.role === 'admin' && !next ? '/admin' : next.startsWith('/') ? next : '/tai-khoan');
}

export async function registerAction(_: Res, f: FormData): Promise<Res> {
  const name = s(f, 'name'), email = s(f, 'email').toLowerCase(), pass = s(f, 'password'), phone = s(f, 'phone');
  if (name.length < 2) return { error: 'Nhập họ tên.' };
  if (!EMAIL.test(email)) return { error: 'Email chưa đúng định dạng.' };
  if (pass.length < 6) return { error: 'Mật khẩu cần ít nhất 6 ký tự.' };
  if (pass !== s(f, 'password2')) return { error: 'Mật khẩu nhập lại chưa khớp.' };
  if (get('SELECT id FROM users WHERE email=?', email)) return { error: 'Email này đã đăng ký. Hãy đăng nhập.' };
  const r = run('INSERT INTO users(name,email,phone,password_hash,created_at) VALUES(?,?,?,?,?)', name, email, phone, hash(pass), nowIso());
  await createSession({ id: Number(r.lastInsertRowid), name, email, role: 'customer' });
  redirect('/tai-khoan');
}

export async function logoutAction() { destroySession(); redirect('/'); }

export async function updateProfileAction(_: Res, f: FormData): Promise<Res> {
  const u = await getUser();
  if (!u) return { error: 'Hãy đăng nhập.' };
  const name = s(f, 'name');
  if (name.length < 2) return { error: 'Nhập họ tên.' };
  const h = parseInt(s(f, 'height'), 10), w = parseInt(s(f, 'weight'), 10);
  run('UPDATE users SET name=?, phone=?, height_cm=?, weight_kg=?, size=?, liked_colors=?, work_env=? WHERE id=?',
    name, s(f, 'phone'), h > 0 ? h : null, w > 0 ? w : null, s(f, 'size') || 'M', f.getAll('colors').join(', '), s(f, 'workEnv'), u.id);
  return { ok: true, msg: 'Đã lưu thông tin.' };
}
