import Link from 'next/link';
import { all } from '@/lib/db';
import { listVariants } from '@/lib/inventory';
import { PageHead } from '@/components/admin/Bits';
import { LOCS, dmyHm, norm, sizeText } from '@/lib/util';
export const dynamic = 'force-dynamic';

export default function Logs({ searchParams }: { searchParams: { idle?: string; lq?: string } }) {
  const vs = listVariants();
  const label = (v: (typeof vs)[number]) => `${v.productName} · ${v.color} · ${sizeText(v.size)}`;
  const alerts = vs.filter((v) => v.available < v.minStock);
  const idle = searchParams.idle === '60' ? 60 : 30;
  const dead = vs.map((v) => ({ v, days: Math.floor((Date.now() - new Date(v.lastSoldAt).getTime()) / 86400000) })).filter((x) => x.days >= idle && x.v.physical > 0).sort((a, b) => b.days - a.days);
  const lq = norm(searchParams.lq || '');
  const logs = all<any>('SELECT * FROM inventory_logs ORDER BY id DESC').filter((l) => !lq || norm(l.sku).includes(lq) || norm(l.reason).includes(lq));
  return (
    <>
      <PageHead group="Quản lý kho" title="Cảnh báo và nhật ký" />
      <section className="card"><h2 className="h2">Cảnh báo chạm ngưỡng an toàn</h2>{!alerts.length && <span className="note">Mọi SKU đang trên ngưỡng an toàn.</span>}
        <ul className="list">{alerts.map((v) => <li key={v.sku}><span><b>{v.sku}</b> · {label(v)}<br /><span style={{ color: 'var(--err)', fontWeight: 600 }}>Khả dụng {v.available}</span> <span className="note">· ngưỡng tối thiểu {v.minStock}</span></span><Link className="ghost" href={`/admin/kho/dat-may?sku=${v.sku}`} aria-label={`Tạo phiếu đặt may cho ${v.sku}`}>Tạo phiếu đặt may</Link></li>)}</ul></section>
      <section className="card"><div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><h2 className="h2">Báo cáo hàng chậm luân chuyển</h2>
        <div style={{ display: 'flex', gap: 8 }}>{[30, 60].map((d) => <Link key={d} href={`/admin/kho/nhat-ky?idle=${d}`} className={'chip' + (idle === d ? ' on' : '')}>Không bán được từ {d} ngày</Link>)}</div></div>
        {!dead.length && <span className="note">Không có SKU nào chậm luân chuyển theo mức này.</span>}
        <div className="scroll"><table className="tb" style={{ minWidth: 760 }}><thead><tr><th>SKU</th><th>Sản phẩm</th><th>Tồn thực tế</th><th>Không bán được</th><th>Thao tác</th></tr></thead>
          <tbody>{dead.map(({ v, days }) => <tr key={v.sku}><td style={{ whiteSpace: 'nowrap' }}><b>{v.sku}</b></td><td style={{ minWidth: 220 }}>{label(v)}</td><td>{v.physical}</td><td><span className={'badge' + (days >= 60 ? ' dark' : ' sand')}>{days} ngày</span></td><td><Link className="ghost" href={`/admin/kho/capsule?add=${v.sku}`} aria-label={`Thêm ${v.sku} vào capsule giảm giá`}>Đưa vào capsule giảm giá</Link></td></tr>)}</tbody></table></div></section>
      <section className="card"><div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}><h2 className="h2">Nhật ký biến động tồn kho</h2>
        <form method="get" className="fl" style={{ minWidth: 260 }}><label className="lbl" htmlFor="log-q" style={{ fontWeight: 500 }}>Tìm theo SKU hoặc lý do</label><input id="log-q" name="lq" className="fld" defaultValue={searchParams.lq} placeholder="Ví dụ: ELR-BLZ hoặc nhập xưởng" /></form></div>
        <div className="scroll"><table className="tb" style={{ minWidth: 860 }}><caption>Hiển thị {Math.min(logs.length, 80)} / {logs.length} giao dịch</caption>
          <thead><tr><th>Ngày giờ</th><th>SKU</th><th>Thay đổi</th><th>Lý do</th><th>Kho</th></tr></thead>
          <tbody>{logs.slice(0, 80).map((l) => <tr key={l.id}><td style={{ whiteSpace: 'nowrap' }}>{dmyHm(l.created_at)}</td><td style={{ whiteSpace: 'nowrap' }}><b>{l.sku}</b></td><td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{l.delta}</td><td style={{ minWidth: 260 }}>{l.reason}</td><td>{l.location ? LOCS[l.location] : ''}</td></tr>)}</tbody></table></div></section>
    </>
  );
}
