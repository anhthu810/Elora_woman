'use client';
import { useRun } from './Flash';
import { setOrderStatus } from '@/app/actions/admin';
import { ORDER_STATUS } from '@/lib/util';
export default function OrderSelect({ code, status }: { code: string; status: number }) {
  const { run, pending } = useRun();
  return (
    <select className="fld" aria-label={`Trạng thái đơn ${code}`} value={status} disabled={pending} style={{ minHeight: 40, minWidth: 150 }} onChange={(e) => run(setOrderStatus(code, parseInt(e.target.value, 10)))}>
      {ORDER_STATUS.map((s, i) => <option key={s} value={i}>{s}</option>)}
    </select>);
}
