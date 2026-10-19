import Link from 'next/link';
import { all, get } from '@/lib/db';
import { listVariants } from '@/lib/inventory';
import { PageHead } from '@/components/admin/Bits';
import ConsultPanel from '@/components/admin/ConsultPanel';
import { fmt, dmy, sizeText } from '@/lib/util';
export const dynamic = 'force-dynamic';

export default function Consult({ searchParams }: { searchParams: { id?: string; all?: string } }) {
  const list = all<any>('SELECT c.*, u.name uname, u.email, u.phone, u.size usize, u.liked_colors liked FROM consults c JOIN users u ON u.id=c.user_id ORDER BY c.id DESC');
  const cs = list.find((c) => String(c.id) === searchParams.id) || list[0];
  const vs = listVariants();
  const picks = cs ? String(cs.picks).split(',').filter(Boolean) : [];
  const likes = cs ? String(cs.liked).split(', ').filter(Boolean) : [];
  const cands = cs ? vs.filter((v) => v.active && v.available > 0 && !picks.includes(v.sku) && (v.size === 'FS' || v.size === cs.usize) && (searchParams.all || !likes.length || likes.includes(v.color)))
    .map((v) => ({ sku: v.sku, label: `${v.productName} · ${v.color} · ${sizeText(v.size)} · khả dụng ${v.available}` })) : [];
  const pickRows = picks.map((s) => { const v = vs.find((x) => x.sku === s); return { sku: s, label: v ? `${v.productName} · ${v.color} · ${sizeText(v.size)}` : s, priceText: v ? fmt(v.price) : '', availText: v ? `khả dụng ${v.available}` : '' }; });
  const holds = cs ? all<any>('SELECT * FROM holds WHERE consult_id=?', cs.id) : [];
  const badge = (s: string) => s === 'Mới' ? 'red' : s === 'Đang phối' ? 'sand' : 'dark';
  return (
    <>
      <PageHead group="Bán hàng" title="Tư vấn phối đồ" />
      {!cs ? <div className="card">Chưa có yêu cầu tư vấn nào.</div> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
          <section aria-label="Danh sách yêu cầu" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
            {list.map((c) => (
              <Link key={c.id} href={`/admin/tu-van?id=${c.id}`} aria-current={c.id === cs.id ? 'true' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 16px', border: '1px solid var(--ink)', background: c.id === cs.id ? 'var(--ink)' : '#fff', color: c.id === cs.id ? '#fff' : 'var(--ink)' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><b>{c.uname}</b><span style={{ fontSize: 12 }}>{dmy(c.created_at)}</span></span>
                <span style={{ fontSize: 13 }}>{c.occasions}</span>
                <span className={'badge ' + badge(c.status)} style={{ alignSelf: 'flex-start', border: c.id === cs.id ? '1px solid #fff' : 'none' }}>{c.status}</span>
              </Link>))}
          </section>
          <section className="card" style={{ flex: '2 1 460px', gap: 20 }}>
            <div><span className="eb">Yêu cầu tư vấn</span><h2 className="disp" style={{ fontSize: 32 }}>{cs.uname}</h2></div>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '14px 24px', fontSize: 14 }}>
              {[['Liên hệ', `${cs.email} · ${cs.phone}`], ['Số đo', cs.height_cm ? `${cs.height_cm} cm, ${cs.weight_kg ?? '?'} kg` : 'Chưa có'], ['Size thường mặc', cs.usize], ['Màu ưa thích', cs.liked || 'Chưa có'], ['Môi trường làm việc', cs.work_env], ['Dịp cần trang phục', cs.occasions], ['Ngân sách mỗi bộ', cs.budget], ['Ngày gửi', dmy(cs.created_at)]].map(([k, v]) => <div key={k}><dt style={{ fontWeight: 600 }}>{k}</dt><dd style={{ margin: 0 }}>{v}</dd></div>)}
            </dl>
            <p style={{ background: '#F6EEEF', border: '1px solid var(--ink)', padding: '14px 16px', fontSize: 14 }}><b>Khách viết:</b> {cs.note || '(không có)'}</p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="note">Danh sách chỉ hiện món còn hàng khả dụng, đúng size {cs.usize}{searchParams.all ? '' : ` và màu khách thích (${cs.liked || 'chưa có'})`}. Phụ kiện free size không lọc theo size.</span>
              <Link className="textbtn" href={`/admin/tu-van?id=${cs.id}${searchParams.all ? '' : '&all=1'}`}>{searchParams.all ? 'Chỉ hiện màu khách thích' : 'Hiện cả màu khác'}</Link>
            </div>
            <ConsultPanel key={cs.id + ':' + picks.join() + cs.status} id={cs.id} stylist={cs.stylist} message={cs.message} picks={pickRows} cands={cands} hasHolds={holds.length > 0} />
          </section>
        </div>)}
    </>
  );
}
