'use client';
import { useState } from 'react';
export default function SizeAdvisor() {
  const [h, setH] = useState(''); const [w, setW] = useState('');
  const hh = parseInt(h, 10), ww = parseInt(w, 10);
  let a = '';
  if (hh > 0 && ww > 0) { const bmi = ww / ((hh / 100) ** 2); a = bmi < 19.5 && hh < 160 ? 'S' : bmi < 21.5 ? (hh >= 165 ? 'M' : 'S') : bmi < 23.5 ? (hh >= 166 ? 'L' : 'M') : bmi < 25.5 ? 'L' : 'XL'; }
  return (
    <div className="card" style={{ background: '#F6EEEF' }}>
      <b>Gợi ý size nhanh</b>
      <div className="row">
        <div className="fl" style={{ width: 130 }}><label className="lbl" htmlFor="sa-h">Chiều cao (cm)</label><input id="sa-h" className="fld" type="number" value={h} onChange={(e) => setH(e.target.value)} /></div>
        <div className="fl" style={{ width: 130 }}><label className="lbl" htmlFor="sa-w">Cân nặng (kg)</label><input id="sa-w" className="fld" type="number" value={w} onChange={(e) => setW(e.target.value)} /></div>
      </div>
      {a ? <p className="ok" role="status">Gợi ý: size {a}. Đây là ước tính, bạn nên đối chiếu thêm số đo bên dưới.</p> : <p className="note">Nhập chiều cao và cân nặng để nhận gợi ý.</p>}
    </div>
  );
}
