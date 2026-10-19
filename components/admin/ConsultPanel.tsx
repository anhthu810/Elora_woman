'use client';
import { useState } from 'react';
import { useRun } from './Flash';
import { saveConsult, sendConsultSet } from '@/app/actions/admin';

type Cand = { sku: string; label: string };
type Pick = { sku: string; label: string; priceText: string; availText: string };
export default function ConsultPanel({ id, stylist: st0, message: m0, picks: p0, cands, hasHolds }: { id: number; stylist: string; message: string; picks: Pick[]; cands: Cand[]; hasHolds: boolean }) {
  const { run, pending } = useRun();
  const [stylist, setStylist] = useState(st0);
  const [message, setMessage] = useState(m0);
  const [add, setAdd] = useState(cands[0]?.sku || '');
  const [hours, setHours] = useState('24');
  const skus = p0.map((p) => p.sku);
  const save = (picks = skus) => run(saveConsult(id, { stylist, message, picks }));
  return (
    <>
      <div className="fl" style={{ maxWidth: 300 }}>
        <label className="lbl" htmlFor="cs-stylist">Stylist phụ trách</label>
        <select id="cs-stylist" className="fld" value={stylist} onChange={(e) => setStylist(e.target.value)}><option value="">Chưa phân công</option>{['Stylist 1', 'Stylist 2', 'Stylist 3'].map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="lbl">Sản phẩm trong set gợi ý</span>
        {!p0.length && <span className="note">Chưa chọn sản phẩm nào.</span>}
        <ul className="list">{p0.map((p) => <li key={p.sku}><span>{p.label} · {p.priceText}<br /><span className="note">{p.sku} · {p.availText}</span></span><button type="button" className="textbtn" onClick={() => save(skus.filter((s) => s !== p.sku))} aria-label={`Bỏ ${p.label}`}>Bỏ</button></li>)}</ul>
        <div className="row">
          <div className="fl" style={{ flex: '1 1 260px' }}><label className="lbl" htmlFor="cs-add" style={{ fontWeight: 500 }}>Thêm sản phẩm còn hàng</label>
            <select id="cs-add" className="fld" value={add} onChange={(e) => setAdd(e.target.value)}>{cands.length ? cands.map((c) => <option key={c.sku} value={c.sku}>{c.label}</option>) : <option value="">Không có sản phẩm phù hợp còn hàng</option>}</select></div>
          <button type="button" className="ghost" style={{ minHeight: 44 }} disabled={!add || pending} onClick={() => save([...skus, add])}>Thêm vào set</button>
        </div>
      </div>
      <div className="fl"><label className="lbl" htmlFor="cs-msg">Lời nhắn gửi khách</label><textarea id="cs-msg" className="fld" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ví dụ: Với buổi họp sáng Thứ Hai, chị thử set này..." /></div>
      <div className="fl" style={{ maxWidth: 300 }}><label className="lbl" htmlFor="cs-hours">Giữ hàng cho khách</label><select id="cs-hours" className="fld" value={hours} onChange={(e) => setHours(e.target.value)}><option value="24">24 giờ</option><option value="48">48 giờ</option></select></div>
      <span className="note">Khi gửi gợi ý, các món trong set được tạm giữ. Hết thời hạn mà khách chưa chốt, hệ thống nhả hàng về kho bán.{hasHolds ? ' Gửi lại sẽ gia hạn thời gian giữ.' : ''}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button type="button" className="ghost" style={{ minHeight: 48 }} disabled={pending} onClick={() => save()}>Lưu nháp</button>
        <button type="button" className="btn" disabled={pending} onClick={async () => { const r = await run(saveConsult(id, { stylist, message, picks: skus })); if (!r.error) await run(sendConsultSet(id, parseInt(hours, 10))); }}>Gửi gợi ý và giữ hàng</button>
      </div>
    </>
  );
}
