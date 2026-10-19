'use server';
import { revalidatePath } from 'next/cache';
import { all, get, run, tx } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { availableOf, sweepHolds } from '@/lib/inventory';
import { SHIPPING_FEE, nowIso, stampDay, pad } from '@/lib/util';
import type { Res } from './auth';

export async function placeOrderAction(input: { lines: { sku: string; qty: number }[]; name: string; phone: string; address: string; pay: string; note: string }): Promise<Res & { code?: string }> {
  const u = await getUser();
  if (!u) return { error: 'Hãy đăng nhập để đặt hàng.' };
  if (!input.lines.length) return { error: 'Giỏ hàng đang trống.' };
  if (input.name.trim().length < 2) return { error: 'Nhập họ tên người nhận.' };
  if (!/^[0-9 +]{9,14}$/.test(input.phone.trim())) return { error: 'Số điện thoại chưa đúng.' };
  if (input.address.trim().length < 8) return { error: 'Nhập địa chỉ giao hàng đầy đủ.' };
  if (!['Thanh toán khi nhận hàng', 'Chuyển khoản'].includes(input.pay)) return { error: 'Chọn hình thức thanh toán.' };
  sweepHolds();
  try {
    const code = tx(() => {
      let total = SHIPPING_FEE; const items: any[] = [];
      for (const l of input.lines) {
        const qty = Math.floor(l.qty);
        if (!(qty > 0)) throw new Error('Số lượng không hợp lệ.');
        const v = get<any>('SELECT v.sku, p.name, p.price, p.sale_price sp, p.active, v.color, v.size FROM variants v JOIN products p ON p.id=v.product_id WHERE v.sku=?', l.sku);
        if (!v || !v.active) throw new Error(`Sản phẩm ${l.sku} hiện không bán.`);
        if (availableOf(l.sku) < qty) throw new Error(`${v.name} (${v.color}, ${v.size}) chỉ còn ${Math.max(0, availableOf(l.sku))} sản phẩm.`);
        const price = v.sp || v.price; total += price * qty;
        items.push({ sku: v.sku, name: `${v.name} (${v.color}, ${v.size === 'FS' ? 'Free size' : v.size})`, qty, price });
      }
      const n = (get<any>('SELECT COUNT(*) c FROM orders').c || 0) + 1;
      const code = `ELW-${stampDay()}-${pad(n % 1000)}${n > 999 ? n : ''}`;
      const o = run('INSERT INTO orders(code,user_id,status,pay_method,shipping_fee,total,recv_name,recv_phone,address,note,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
        code, u.id, 0, input.pay, SHIPPING_FEE, total, input.name.trim(), input.phone.trim(), input.address.trim(), input.note.trim(), nowIso());
      for (const it of items) run('INSERT INTO order_lines(order_id,sku,name,qty,price) VALUES(?,?,?,?,?)', o.lastInsertRowid, it.sku, it.name, it.qty, it.price);
      return code;
    });
    revalidatePath('/tai-khoan');
    return { ok: true, code, msg: 'Đặt hàng thành công.' };
  } catch (e: any) { return { error: e.message }; }
}

export async function createConsultAction(_: Res, f: FormData): Promise<Res> {
  const u = await getUser();
  if (!u) return { error: 'Hãy đăng nhập để gửi yêu cầu tư vấn.' };
  const s = (k: string) => String(f.get(k) ?? '').trim();
  const occ = f.getAll('occasions').join(', ');
  if (!s('workEnv')) return { error: 'Chọn môi trường làm việc.' };
  if (!occ) return { error: 'Chọn ít nhất một dịp cần trang phục.' };
  if (!s('budget')) return { error: 'Chọn ngân sách.' };
  const h = parseInt(s('height'), 10), w = parseInt(s('weight'), 10);
  run('INSERT INTO consults(user_id,work_env,occasions,budget,height_cm,weight_kg,note,created_at) VALUES(?,?,?,?,?,?,?,?)',
    u.id, s('workEnv'), occ, s('budget'), h > 0 ? h : null, w > 0 ? w : null, s('note'), nowIso());
  revalidatePath('/tai-khoan');
  return { ok: true, msg: 'Đã gửi yêu cầu. Stylist sẽ phản hồi trong vòng 24 giờ.' };
}
