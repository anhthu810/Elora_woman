import { all, get, run, tx } from './db';
import { LOC_KEYS, nowIso, mkSku, stampDay, pad, barcodeDigits } from './util';

export type VariantRow = {
  id: number; sku: string; productId: number; productName: string; productCode: string; category: string; price: number; active: number;
  color: string; size: string; minStock: number; online: number; showroom: number; styling: number; physical: number; reserved: number; available: number; lastSoldAt: string;
};

export function log(sku: string, delta: string, reason: string, location = '') {
  run('INSERT INTO inventory_logs(created_at,sku,delta,reason,location) VALUES(?,?,?,?,?)', nowIso(), sku, delta, reason, location);
}

/** Nhả các hàng giữ hết hạn về kho bán. Gọi trước khi đọc tồn kho. */
export function sweepHolds() {
  const expired = all<any>('SELECT h.*, c.user_id FROM holds h JOIN consults c ON c.id=h.consult_id WHERE h.expires_at <= ?', nowIso());
  if (!expired.length) return 0;
  tx(() => {
    for (const h of expired) {
      log(h.sku, `Nhả ${h.qty}`, `Tự nhả giữ hàng hết hạn (yêu cầu tư vấn #${h.consult_id})`);
      run('DELETE FROM holds WHERE id=?', h.id);
    }
  });
  return expired.length;
}

export function reservedMap(): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of all<any>('SELECT sku, SUM(qty) q FROM holds WHERE expires_at > ? GROUP BY sku', nowIso())) m[r.sku] = (m[r.sku] || 0) + r.q;
  for (const r of all<any>('SELECT l.sku, SUM(l.qty) q FROM order_lines l JOIN orders o ON o.id=l.order_id WHERE o.status < 2 GROUP BY l.sku')) m[r.sku] = (m[r.sku] || 0) + r.q;
  return m;
}

export function listVariants(productId?: number): VariantRow[] {
  const res = reservedMap();
  const rows = all<any>(
    `SELECT v.id, v.sku, v.product_id productId, p.name productName, p.code productCode, p.category, p.price, p.active, v.color, v.size, v.min_stock minStock, v.last_sold_at lastSoldAt,
      COALESCE(SUM(CASE WHEN s.location='online' THEN s.qty END),0) online,
      COALESCE(SUM(CASE WHEN s.location='showroom' THEN s.qty END),0) showroom,
      COALESCE(SUM(CASE WHEN s.location='styling' THEN s.qty END),0) styling
     FROM variants v JOIN products p ON p.id=v.product_id LEFT JOIN stocks s ON s.variant_id=v.id
     ${productId ? 'WHERE v.product_id=?' : ''} GROUP BY v.id ORDER BY p.id, v.color, CASE v.size WHEN 'S' THEN 1 WHEN 'M' THEN 2 WHEN 'L' THEN 3 WHEN 'XL' THEN 4 ELSE 5 END`,
    ...(productId ? [productId] : []));
  return rows.map((r) => {
    const physical = r.online + r.showroom + r.styling;
    const reserved = res[r.sku] || 0;
    return { ...r, physical, reserved, available: physical - reserved };
  });
}

export function variantBySku(sku: string) { return listVariants().find((v) => v.sku === sku); }

export function availableOf(sku: string) {
  const v = get<any>('SELECT COALESCE(SUM(s.qty),0) q FROM variants v LEFT JOIN stocks s ON s.variant_id=v.id WHERE v.sku=?', sku);
  return (v?.q || 0) - (reservedMap()[sku] || 0);
}

function stockQty(variantId: number, loc: string) {
  return get<any>('SELECT qty FROM stocks WHERE variant_id=? AND location=?', variantId, loc)?.qty || 0;
}

/** Cộng/trừ tồn tại một kho. Ném lỗi nếu âm. Cần gọi trong tx. */
export function adjust(sku: string, loc: string, delta: number) {
  const v = get<any>('SELECT id FROM variants WHERE sku=?', sku);
  if (!v) throw new Error(`Không có SKU ${sku}.`);
  const cur = stockQty(v.id, loc);
  if (cur + delta < 0) throw new Error(`Kho ${loc} chỉ còn ${cur} sản phẩm ${sku}.`);
  run('INSERT INTO stocks(variant_id,location,qty) VALUES(?,?,?) ON CONFLICT(variant_id,location) DO UPDATE SET qty=excluded.qty', v.id, loc, cur + delta);
}

/** Trừ theo thứ tự kho ưu tiên. Trả về danh sách [kho, số lượng]. */
export function takeFrom(sku: string, qty: number, locs: string[]) {
  const v = get<any>('SELECT id FROM variants WHERE sku=?', sku);
  if (!v) throw new Error(`Không có SKU ${sku}.`);
  let need = qty; const out: [string, number][] = [];
  for (const l of locs) {
    const t = Math.min(need, stockQty(v.id, l));
    if (t > 0) { adjust(sku, l, -t); out.push([l, t]); need -= t; }
  }
  if (need > 0) throw new Error(`Không đủ tồn thực tế cho ${sku}.`);
  return out;
}

export function ensureVariant(productId: number, color: string, size: string, minStock = 3) {
  const p = get<any>('SELECT code FROM products WHERE id=?', productId);
  if (!p) throw new Error('Không tìm thấy sản phẩm.');
  const sku = mkSku(p.code, color, size);
  const ex = get<any>('SELECT id FROM variants WHERE sku=?', sku);
  if (ex) return { sku, created: false, id: ex.id as number };
  const r = run('INSERT INTO variants(sku,product_id,color,size,min_stock,last_sold_at) VALUES(?,?,?,?,?,?)', sku, productId, color, size, minStock, nowIso());
  return { sku, created: true, id: Number(r.lastInsertRowid) };
}

export function nextCode(prefix: string, table: string) {
  const n = get<any>(`SELECT COUNT(*) c FROM ${table}`)?.c || 0;
  return `${prefix}-${stampDay()}-${pad(n + 1)}`;
}

export function capsuleSets(sku: string[]) {
  const vs = listVariants();
  const comps = sku.map((s) => vs.find((v) => v.sku === s)).filter(Boolean) as VariantRow[];
  if (!comps.length) return { sets: 0, limit: '' };
  const sets = Math.max(0, Math.min(...comps.map((c) => c.available)));
  const lim = comps.find((c) => Math.max(0, c.available) === sets);
  return { sets, limit: lim?.sku || '' };
}
export { barcodeDigits, LOC_KEYS };
