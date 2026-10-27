import type { ComponentKind, ComponentCategory } from '@/types/structure';
import { COMPONENT_META } from '@/types/structure';
import { CATEGORY_COLOR, CATEGORY_LABEL } from './views';

const ORDER: ComponentCategory[] = ['person', 'trust', 'entity', 'asset', 'instrument', 'institution'];

export default function Palette({ armed, onArm }: { armed: ComponentKind | null; onArm: (k: ComponentKind | null) => void }) {
  const kinds = Object.keys(COMPONENT_META) as ComponentKind[];
  return (
    <div className="lab-palette">
      <p className="tiny muted" style={{ marginBottom: 12 }}>Drag onto the canvas, or tap an item then tap the canvas. {kinds.length} components.</p>
      {ORDER.map((cat) => (
        <div key={cat} className="lab-palette-group">
          <div className="eyebrow" style={{ color: CATEGORY_COLOR[cat] }}>{CATEGORY_LABEL[cat]}</div>
          {kinds.filter((k) => COMPONENT_META[k].category === cat).map((k) => {
            const m = COMPONENT_META[k];
            return (
              <button
                key={k}
                className={`lab-palette-item ${armed === k ? 'armed' : ''}`}
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('application/x-component-kind', k); e.dataTransfer.effectAllowed = 'copy'; }}
                onClick={() => onArm(armed === k ? null : k)}
                title={`${m.label} — drag onto the canvas or click to arm, then click the canvas`}
                aria-pressed={armed === k}
              >
                <span className={`lab-swatch ${cat}`} style={{ color: CATEGORY_COLOR[cat] }}><span>{cat === 'person' ? '' : m.short.slice(0, 4)}</span></span>
                <span style={{ flex: 1 }}>{m.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
