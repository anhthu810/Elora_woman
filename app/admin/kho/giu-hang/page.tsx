import { all } from '@/lib/db';
import { PageHead } from '@/components/admin/Bits';
import { Act } from '@/components/admin/Flash';
import { buyHold, releaseHold, simulateHours } from '@/app/actions/admin';
import { hoursLeft } from '@/lib/util';
export const dynamic = 'force-dynamic';

export default function Holds() {
  const rows = all<any>(`SELECT h.*, u.name uname, p.name pname, v.color, v.size FROM holds h JOIN consults c ON c.id=h.consult_id JOIN users u ON u.id=c.user_id
    JOIN variants v ON v.sku=h.sku JOIN products p ON p.id=v.product_id ORDER BY h.expires_at`);
  return (
    <>
      <PageHead group="Quản lý kho" title="Giữ hàng styling" note="Hàng giữ được tạo khi stylist gửi gợi ý outfit (24 hoặc 48 giờ). Hàng đang giữ được tính vào Tạm giữ nên không bán cho người khác. Hết hạn mà khách chưa chốt, hệ thống tự nhả về kho bán." />
      <div className="row"><Act action={simulateHours} args={[12]}>Giả lập trôi 12 giờ</Act><span className="note">Nút này chỉ để xem cơ chế tự nhả hàng.</span></div>
      {!rows.length && <div className="card" style={{ background: '#F6EEEF' }}><b>Chưa có hàng nào đang được giữ</b><span className="note">Gửi gợi ý cho khách ở mục Tư vấn phối đồ để tạo giữ hàng.</span></div>}
      <div className="scroll"><table className="tb" style={{ minWidth: 880 }}><caption>Đang giữ {rows.length} món</caption>
        <thead><tr><th>Khách hàng</th><th>Sản phẩm</th><th>SKU</th><th>SL</th><th>Còn lại</th><th>Thao tác</th></tr></thead>
        <tbody>{rows.map((h) => { const left = hoursLeft(h.expires_at); return (
          <tr key={h.id}><td><b>{h.uname}</b></td><td style={{ minWidth: 220 }}>{h.pname} · {h.color} · {h.size}</td><td style={{ whiteSpace: 'nowrap' }}>{h.sku}</td><td>{h.qty}</td><td><span className={'badge ' + (left <= 6 ? 'red' : '')}>Còn {left} giờ</span></td>
            <td style={{ whiteSpace: 'nowrap' }}><Act action={buyHold} args={[h.id]} label={`Khách chốt mua ${h.sku}`}>Khách chốt mua</Act> <Act action={releaseHold} args={[h.id]} label={`Nhả giữ hàng ${h.sku}`}>Nhả hàng</Act></td></tr>); })}</tbody></table></div>
    </>
  );
}
