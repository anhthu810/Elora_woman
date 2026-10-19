import Link from 'next/link';
import { all } from '@/lib/db';
import { listVariants } from '@/lib/inventory';
import { PageHead } from '@/components/admin/Bits';
import { Act } from '@/components/admin/Flash';
import { setOrderStatus } from '../actions/admin';
import { fmt, dmy } from '@/lib/util';
export const dynamic = 'force-dynamic';

export default function Overview() {
  const orders = all<any>('SELECT o.*, u.name uname FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.id DESC');
  const pending = orders.filter((o) => o.status === 0);
  const rev = orders.filter((o) => o.status === 3).reduce((n, o) => n + o.total, 0);
  const consults = all<any>("SELECT c.*, u.name uname FROM consults c JOIN users u ON u.id=c.user_id WHERE c.status='Mới' ORDER BY c.id DESC");
  const low = listVariants().filter((v) => v.available < v.minStock);
  return (
    <>
      <PageHead group="Bán hàng" title="Tổng quan" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
        <div className="kpi"><span className="lbl">Đơn chờ xác nhận</span><b>{pending.length}</b><span className="note">Cần xác nhận trong ngày</span></div>
        <div className="kpi"><span className="lbl">Doanh thu đơn đã giao</span><b>{fmt(rev)}</b><span className="note">{orders.filter((o) => o.status === 3).length} đơn đã giao</span></div>
        <div className="kpi"><span className="lbl">Yêu cầu tư vấn mới</span><b>{consults.length}</b><span className="note">Chưa có stylist phối đồ</span></div>
        <div className="kpi"><span className="lbl">SKU dưới ngưỡng</span><b>{low.length}</b><span className="note">Cần đặt may thêm</span></div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <section className="card" style={{ flex: '1 1 340px' }}><h2 className="h2">Đơn chờ xác nhận</h2>
          {!pending.length && <span className="note">Không có đơn nào đang chờ.</span>}
          <ul className="list">{pending.slice(0, 5).map((o) => <li key={o.id}><span><b>{o.code}</b> · {o.uname}<br /><span className="note">{fmt(o.total)} · {o.pay_method}</span></span><Act action={setOrderStatus} args={[o.code, 1]}>Xác nhận</Act></li>)}</ul></section>
        <section className="card" style={{ flex: '1 1 340px' }}><h2 className="h2">Yêu cầu tư vấn mới</h2>
          {!consults.length && <span className="note">Không có yêu cầu mới.</span>}
          <ul className="list">{consults.slice(0, 5).map((c) => <li key={c.id}><span><b>{c.uname}</b> · {dmy(c.created_at)}<br /><span className="note">{c.occasions}</span></span><Link href={`/admin/tu-van?id=${c.id}`} className="ghost">Xử lý</Link></li>)}</ul></section>
        <section className="card" style={{ flex: '1 1 340px' }}><h2 className="h2">Tồn kho dưới ngưỡng an toàn</h2>
          {!low.length && <span className="note">Chưa có SKU nào dưới ngưỡng.</span>}
          <ul className="list">{low.slice(0, 5).map((v) => <li key={v.sku}><span><b>{v.productName}</b> · {v.color} · {v.size}<br /><span style={{ color: 'var(--err)', fontWeight: 600 }}>Khả dụng {v.available}, ngưỡng {v.minStock}</span></span><Link href={`/admin/kho/dat-may?sku=${v.sku}`} className="ghost">Đặt may</Link></li>)}</ul></section>
      </div>
    </>
  );
}
