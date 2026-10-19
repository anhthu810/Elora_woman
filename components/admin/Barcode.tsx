import { barcodeDigits } from '@/lib/util';
export default function Barcode({ text }: { text: string }) {
  const dg = barcodeDigits(text);
  const bars: { w: number; dark: boolean }[] = [{ w: 2, dark: true }, { w: 2, dark: false }, { w: 2, dark: true }];
  for (const ch of dg) { const d = parseInt(ch, 10); bars.push({ w: 2 + (d % 3), dark: true }, { w: 2 + ((d >> 1) % 2), dark: false }); }
  bars.push({ w: 2, dark: true });
  return (
    <div role="img" aria-label={`Mã vạch ${dg}`}>
      <div style={{ display: 'flex', alignItems: 'stretch', background: '#fff', padding: '8px 0', overflow: 'hidden', height: 62 }}>
        {bars.map((b, i) => <span key={i} style={{ flex: 'none', width: b.w, background: b.dark ? '#1E1B1E' : '#fff' }} />)}
      </div>
      <span style={{ fontSize: 12, letterSpacing: '.2em', fontVariantNumeric: 'tabular-nums' }}>{dg}</span>
    </div>);
}
