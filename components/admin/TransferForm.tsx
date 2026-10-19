'use client';
import { useState } from 'react';
import { useRun } from './Flash';
import { createTransfer } from '@/app/actions/admin';
import { LOCS } from '@/lib/util';

export default function TransferForm({ skus }: { skus: { sku: string; label: string; online: number; showroom: number; styling: number }[] }) {
  const { run, pending } = useRun();
  const [f, setF] = useState({ from: 'online', to: 'showroom', sku: skus[0]?.sku || '', qty: '' });
  const [err, setErr] = useState('');
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <section className="card"><h2 className="h2">Tạo phiếu điều chuyển nội bộ</h2>
      <div className="grid">
        <div className="fl"><label className="lbl" htmlFor="tr-from">Kho xuất</label><select id="tr-from" className="fld" value={f.from} onChange={set('from')}>{Object.entries(LOCS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></div>
        <div className="fl"><label className="lbl" htmlFor="tr-to">Kho nhận</label><select id="tr-to" className="fld" value={f.to} onChange={set('to')}>{Object.entries(LOCS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></div>
        <div className="fl" style={{ gridColumn: 'span 2' }}><label className="lbl" htmlFor="tr-sku">SKU cần chuyển</label><select id="tr-sku" className="fld" value={f.sku} onChange={set('sku')}>{skus.map((s) => <option key={s.sku} value={s.sku}>{s.label} · có {(s as any)[f.from]} ở kho xuất</option>)}</select></div>
        <div className="fl"><label className="lbl" htmlFor="tr-qty">Số lượng</label><input id="tr-qty" type="number" className="fld" value={f.qty} onChange={set('qty')} /></div>
      </div>
      <div className="row"><button className="btn" disabled={pending} onClick={async () => { const r = await run(createTransfer({ sku: f.sku, from: f.from, to: f.to, qty: parseInt(f.qty, 10) || 0 })); setErr(r.error || ''); if (r.ok) setF({ ...f, qty: '' }); }}>Tạo phiếu xuất chuyển</button></div>
      {err && <p className="err" role="alert">{err}</p>}
      <span className="note">Tạo phiếu sẽ trừ hàng ở kho xuất. Khi kho nhận xác nhận, hàng được cộng vào kho nhận, tránh lệch số liệu giữa các kênh bán.</span>
    </section>);
}
