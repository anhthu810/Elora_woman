export function PageHead({ group, title, note }: { group: string; title: string; note?: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span className="eb">{group}</span><h1 className="disp" style={{ fontSize: 'clamp(34px,4vw,50px)', lineHeight: 1 }}>{title}</h1></div>
      {note && <span className="note" style={{ maxWidth: 360 }}>{note}</span>}
    </div>
  );
}
