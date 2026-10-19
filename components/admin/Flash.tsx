'use client';
import { createContext, useCallback, useContext, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { R } from '@/app/actions/admin';

type Ctx = { run: (p: Promise<R>) => Promise<R>; pending: boolean };
const C = createContext<Ctx>(null as any);
export const useRun = () => useContext(C);

export function FlashProvider({ children }: { children: React.ReactNode }) {
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = useCallback(async (p: Promise<R>) => {
    const r = await p;
    setFlash({ ok: !r.error, text: r.error || r.msg || 'Xong.' });
    start(() => router.refresh());
    return r;
  }, [router]);
  return (
    <C.Provider value={{ run, pending }}>
      {flash && <div className={'flash ' + (flash.ok ? 'good' : 'bad')} role={flash.ok ? 'status' : 'alert'} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>{flash.text}</span><button onClick={() => setFlash(null)} className="textbtn" style={{ color: 'inherit', minHeight: 0 }}>Đóng</button></div>}
      {children}
    </C.Provider>
  );
}

/** Nút gọi server action. */
export function Act({ action, args = [], children, primary, confirm: ask, label, disabled }: { action: (...a: any[]) => Promise<R>; args?: any[]; children: React.ReactNode; primary?: boolean; confirm?: string; label?: string; disabled?: boolean }) {
  const { run, pending } = useRun();
  return <button type="button" className={primary ? 'btn' : 'ghost'} aria-label={label} disabled={pending || disabled} onClick={() => { if (ask && !window.confirm(ask)) return; run(action(...args)); }}>{children}</button>;
}
