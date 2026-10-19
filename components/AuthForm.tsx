'use client';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, registerAction, type Res } from '@/app/actions/auth';

function Submit({ label }: { label: string }) { const { pending } = useFormStatus(); return <button className="btn" disabled={pending}>{pending ? 'Đang xử lý...' : label}</button>; }

export default function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const [st, action] = useFormState<Res, FormData>(mode === 'login' ? loginAction : registerAction, {});
  const L = mode === 'login';
  return (
    <form action={action} className="card" style={{ maxWidth: 460, margin: '0 auto', gap: 18 }}>
      <div><span className="eb">{L ? 'Chào mừng trở lại' : 'Tạo tài khoản'}</span><h1 className="disp" style={{ fontSize: 44, lineHeight: 1 }}>{L ? 'Đăng nhập' : 'Đăng ký'}</h1></div>
      {next && <input type="hidden" name="next" value={next} />}
      {!L && <div className="fl"><label className="lbl" htmlFor="a-name">Họ tên</label><input id="a-name" name="name" className="fld" autoComplete="name" /></div>}
      <div className="fl"><label className="lbl" htmlFor="a-email">Email</label><input id="a-email" name="email" type="email" className="fld" autoComplete="email" /></div>
      {!L && <div className="fl"><label className="lbl" htmlFor="a-phone">Số điện thoại</label><input id="a-phone" name="phone" className="fld" autoComplete="tel" /></div>}
      <div className="fl"><label className="lbl" htmlFor="a-pass">Mật khẩu</label><input id="a-pass" name="password" type="password" className="fld" autoComplete={L ? 'current-password' : 'new-password'} /></div>
      {!L && <div className="fl"><label className="lbl" htmlFor="a-pass2">Nhập lại mật khẩu</label><input id="a-pass2" name="password2" type="password" className="fld" autoComplete="new-password" /></div>}
      {st.error && <p className="err" role="alert">{st.error}</p>}
      <Submit label={L ? 'Đăng nhập' : 'Tạo tài khoản'} />
      {L ? <p className="note">Chưa có tài khoản? <Link href="/dang-ky" style={{ textDecoration: 'underline', color: 'var(--wine)', fontWeight: 600 }}>Đăng ký</Link></p>
         : <p className="note">Đã có tài khoản? <Link href="/dang-nhap" style={{ textDecoration: 'underline', color: 'var(--wine)', fontWeight: 600 }}>Đăng nhập</Link></p>}
      {L && <p className="note" style={{ background: '#F6EEEF', padding: '10px 12px', border: '1px solid var(--ink)' }}>Tài khoản mẫu: ha.nguyen@example.com / elora123 (khách hàng), admin@elora.vn / admin123 (quản trị).</p>}
    </form>
  );
}
