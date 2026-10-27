import { useMemo, useState } from 'react';
import { Panel, Eyebrow, SectionHeader, Chip, ConfidenceChip, Disclaimer, Callout, TextField, ObjectiveTags } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { uid } from '@/lib/format';
import { deriveConsequences, normalize, ALL_COMBINATIONS, PRESETS, configKey, type TrustConfig, type Flag } from './model';
import './trust.css';

const W = 1000, H = 640;
const SETTLOR = { x: 130, y: 120 }, TAX = { x: 130, y: 330 }, BENS = { x: 130, y: 540 }, PROTECTOR = { x: 860, y: 90 };
const BW = 150, BH = 56;
const FOREIGN_SHIFT = 110;

interface Scene { config: TrustConfig; assets: string[]; beneficiaries: string[]; protector: boolean }
const INITIAL: Scene = { config: PRESETS[2].config, assets: PRESETS[2].assets, beneficiaries: PRESETS[2].beneficiaries, protector: true };

export default function TrustExplorerPage() {
  const saveScenario = useAppStore((s) => s.saveScenario);
  const [scene, setScene] = useState<Scene>(INITIAL);
  const [presetId, setPresetId] = useState<string | null>('dynasty');
  const [bensOpen, setBensOpen] = useState(true);
  const [newAsset, setNewAsset] = useState('');
  const [newBen, setNewBen] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  const cfg = normalize(scene.config);
  const cons = useMemo(() => deriveConsequences(scene.config), [scene.config]);
  const setCfg = (patch: Partial<TrustConfig>) => { setPresetId(null); setScene((s) => ({ ...s, config: normalize({ ...s.config, ...patch }) })); };
  const applyPreset = (id: string, variant = false) => {
    const p = PRESETS.find((x) => x.id === id); if (!p) return;
    setPresetId(id);
    setScene({ config: variant && p.variant ? p.variant.config : p.config, assets: p.assets, beneficiaries: p.beneficiaries, protector: p.protector });
  };
  const preset = PRESETS.find((p) => p.id === presetId);
  const save = () => {
    saveScenario({ id: uid(), kind: 'trust', name: preset ? preset.name : cons.label, createdAt: Date.now(), data: { ...scene, config: cfg, key: cons.key } });
    setSaved('Saved to your scenarios.'); setTimeout(() => setSaved(null), 2400);
  };

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Explorer · one diagram, sixteen architectures"
        title={<>Trust <span className="gold" style={{ fontStyle: 'italic', fontWeight: 400 }}>Explorer</span></>}
        lede="A trust is a relationship, not a box: someone gives, someone holds and controls, someone watches the holder, someone benefits. Four design choices change who is taxed, what a creditor can reach, what the estate includes and what has to be reported. Flip them and watch the architecture rearrange itself. Everything here depends on jurisdiction and individual facts."
      />

      {/* Toggles */}
      <div className="tx-toggles" style={{ marginBottom: 16 }}>
        <Toggle label="Revocability" a="Revocable" b="Irrevocable" value={cfg.revocable} onChange={(v) => setCfg({ revocable: v })} note={cfg.revocable ? 'Settlor keeps the power to revoke or amend.' : 'The power to revoke is cut. Protection and exclusion become possible.'} />
        <Toggle label="Income tax status" a="Grantor" b="Non-grantor" value={cfg.grantor} onChange={(v) => setCfg({ grantor: v })} disabled={cfg.revocable} note={cfg.revocable ? 'Locked: a revocable trust is a grantor trust (IRC §676).' : cfg.grantor ? 'Settlor pays tax on trust income (§§671–677).' : 'Trust is its own taxpayer (Form 1041, compressed brackets).'} />
        <Toggle label="Situs" a="Domestic" b="Foreign" value={!cfg.foreign} onChange={(v) => setCfg({ foreign: !v })} note={cfg.foreign ? 'Reporting flows back to the home tax authority (Forms 3520 / 3520-A; FBAR where applicable).' : 'Trust and trustee sit in the home jurisdiction.'} />
        <Toggle label="Distributions" a="Discretionary" b="Fixed" value={cfg.discretionary} onChange={(v) => setCfg({ discretionary: v })} note={cfg.discretionary ? 'Trustee decides whether, when and how much.' : 'Fixed percentage or mandatory income; certainty over protection.'} />
      </div>

      <div className="tx-layout">
        <Panel style={{ padding: 16 }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <div className="row" style={{ gap: 8 }}><Eyebrow>{cons.label}</Eyebrow>{preset && <Chip tone="gold">{preset.name}</Chip>}</div>
            <div className="row" style={{ gap: 6 }}><button className="btn sm" onClick={save}>Save scenario</button>{saved && <span className="tiny green">{saved}</span>}</div>
          </div>
          <div className="tx-stage-wrap">
            <Diagram cfg={cfg} assets={scene.assets} beneficiaries={scene.beneficiaries} protector={scene.protector} onToggleBens={() => setBensOpen((o) => !o)} />
          </div>
          <div className="tx-lists" style={{ marginTop: 14 }}>
            <div>
              <div className="row between" style={{ marginBottom: 6 }}>
                <span className="tiny muted" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>Beneficiaries ({scene.beneficiaries.length})</span>
                <button className="btn sm ghost" onClick={() => setBensOpen((o) => !o)}>{bensOpen ? 'Collapse' : 'Expand'}</button>
              </div>
              {bensOpen && (
                <>
                  <div className="tx-chips">
                    {scene.beneficiaries.map((b) => <span key={b} className="chip violet">{b}<button aria-label={`Remove ${b}`} onClick={() => setScene((s) => ({ ...s, beneficiaries: s.beneficiaries.filter((x) => x !== b) }))}>✕</button></span>)}
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 8 }}>
                    <div style={{ flex: 1 }}><TextField value={newBen} onChange={setNewBen} placeholder="Add beneficiary (e.g. Grandchildren)" /></div>
                    <button className="btn sm" onClick={() => { if (newBen.trim()) { setScene((s) => ({ ...s, beneficiaries: [...s.beneficiaries, newBen.trim()] })); setNewBen(''); } }}>Add</button>
                  </div>
                </>
              )}
            </div>
            <div>
              <div className="row between" style={{ marginBottom: 6 }}>
                <span className="tiny muted" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>Trust assets ({scene.assets.length})</span>
                <label className="tiny muted row" style={{ gap: 6 }}><input type="checkbox" checked={scene.protector} onChange={(e) => setScene((s) => ({ ...s, protector: e.target.checked }))} /> Protector appointed</label>
              </div>
              <div className="tx-chips">
                {scene.assets.map((a) => <span key={a} className="chip gold">{a}<button aria-label={`Remove ${a}`} onClick={() => setScene((s) => ({ ...s, assets: s.assets.filter((x) => x !== a) }))}>✕</button></span>)}
              </div>
              <div className="row" style={{ gap: 6, marginTop: 8 }}>
                <div style={{ flex: 1 }}><TextField value={newAsset} onChange={setNewAsset} placeholder="Add asset (e.g. Operating Co units)" /></div>
                <button className="btn sm" onClick={() => { if (newAsset.trim()) { setScene((s) => ({ ...s, assets: [...s.assets, newAsset.trim()] })); setNewAsset(''); } }}>Add</button>
              </div>
            </div>
          </div>
        </Panel>

        {/* Consequences */}
        <Panel className="tx-cons" tone="gold">
          <Eyebrow>Consequences</Eyebrow>
          <h3 style={{ fontSize: '1.3rem', marginTop: 6 }}>{cons.label}</h3>
          {cons.unavailable && <Callout tone="amber"><p style={{ margin: 0, fontSize: '0.85rem' }}>{cons.unavailable}</p></Callout>}
          <h4>Who is taxed on income</h4>
          <p><strong>{cons.incomeTax.who}.</strong> {cons.incomeTax.detail}</p>
          <h4>Estate inclusion risk (§§2036–2038)</h4>
          {cons.estateInclusion.map((f) => <FlagRow key={f.text} f={f} />)}
          <h4>Creditor reach — settlor</h4>
          <FlagRow f={cons.creditorSettlor} />
          <h4>Creditor reach — beneficiaries</h4>
          <FlagRow f={cons.creditorBeneficiaries} />
          <h4>Reporting implicated</h4>
          <ul>{cons.reporting.map((r) => <li key={r}>{r}</li>)}</ul>
          <h4>Flexibility</h4>
          <p><Chip tone={cons.flexibility.level === 'high' ? 'green' : cons.flexibility.level === 'medium' ? 'amber' : 'red'}>{cons.flexibility.level}</Chip> <span style={{ marginLeft: 6 }}>{cons.flexibility.detail}</span></p>
          <h4>Typical uses</h4>
          <ul>{cons.uses.map((u) => <li key={u}>{u}</li>)}</ul>
          <h4>Typical costs</h4>
          <p>{cons.costs}</p>
          <h4>Professionals involved</h4>
          <ul>{cons.professionals.map((p) => <li key={p}>{p}</li>)}</ul>
          <h4>Objectives in play</h4>
          <ObjectiveTags objectives={cfg.revocable ? ['estate-planning', 'privacy', 'succession'] : cfg.foreign ? ['asset-protection', 'estate-planning', 'governance', 'privacy'] : ['asset-protection', 'estate-planning', 'tax-planning', 'succession', 'governance']} />
          <div style={{ marginTop: 12 }}><Chip tone="amber">Not yet jurisdictionally verified</Chip></div>
        </Panel>
      </div>

      {/* Presets */}
      <section className="section">
        <SectionHeader eyebrow="Preset gallery" title="Six trusts people actually set up" lede="Each preset sets the four toggles and loads a typical asset and beneficiary list. The description says what it is for and what tends to go wrong." />
        <div className="tx-presets">
          {PRESETS.map((p) => (
            <button key={p.id} className={`tx-preset ${presetId === p.id ? 'on' : ''}`} onClick={() => applyPreset(p.id)}>
              <div className="row between"><span className="n">{p.name}</span>{presetId === p.id && <Chip tone="gold">active</Chip>}</div>
              <div className="row" style={{ gap: 4, marginTop: 8 }}>
                <Chip>{p.config.revocable ? 'Revocable' : 'Irrevocable'}</Chip><Chip>{p.config.grantor ? 'Grantor' : 'Non-grantor'}</Chip><Chip>{p.config.foreign ? 'Foreign' : 'Domestic'}</Chip><Chip>{p.config.discretionary ? 'Discretionary' : 'Fixed'}</Chip>
              </div>
              <div className="d">{p.description}</div>
              {p.variant && <div style={{ marginTop: 10 }}><span className="btn sm ghost" role="button" onClick={(e) => { e.stopPropagation(); applyPreset(p.id, true); }}>{p.variant.label} →</span></div>}
            </button>
          ))}
        </div>
      </section>

      {/* Comparison matrix */}
      <section className="section">
        <SectionHeader eyebrow="Comparison" title="All sixteen combinations" lede="Click a row to load it into the diagram. Four combinations are greyed because a revocable trust cannot be a non-grantor trust." />
        <div className="table-wrap">
          <table className="table tx-matrix">
            <thead><tr><th>Architecture</th><th>Income taxed to</th><th>Estate</th><th>Settlor's creditors</th><th>Beneficiaries' creditors</th><th>Key reporting</th><th>Flexibility</th></tr></thead>
            <tbody>
              {ALL_COMBINATIONS.map((c) => {
                const d = deriveConsequences(c);
                const on = configKey(c) === configKey(scene.config);
                return (
                  <tr key={d.key} className={`${on ? 'on' : ''} ${d.unavailable ? 'na' : ''}`} onClick={() => { setPresetId(null); setScene((s) => ({ ...s, config: normalize(c) })); }}>
                    <td style={{ whiteSpace: 'nowrap' }}>{d.label}{d.unavailable && <div className="tiny muted">not available (§676)</div>}</td>
                    <td>{d.incomeTax.short}</td>
                    <td>{d.estateShort}</td>
                    <td><span className="row" style={{ gap: 6 }}><ConfidenceChip level={d.creditorSettlor.level} short />{c.revocable ? 'Reachable' : c.foreign ? 'Foreign barriers; US contempt risk if self-settled' : c.discretionary ? 'Beyond reach unless self-settled (DAPT caveat)' : 'Beyond reach unless interest retained'}</span></td>
                    <td><span className="row" style={{ gap: 6 }}><ConfidenceChip level={d.creditorBeneficiaries.level} short />{c.discretionary ? 'Spendthrift + discretion' : 'Spendthrift; due distributions reachable'}</span></td>
                    <td>{c.revocable ? 'None separate' : c.foreign ? '709 · 3520 / 3520-A · FBAR' : c.grantor ? '709 · 1041 (info)' : '709 · 1041 + K-1s'}</td>
                    <td>{d.flexibility.level}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Disclaimer>The trust explorer teaches how four design choices interact under US federal law as commonly described; state trust codes, foreign law, treaty positions and the actual drafting decide the result in any real case. Nothing here eliminates tax: it changes who reports income, what is included in an estate and what a creditor can reach. Trust counsel, a tax adviser and a fiduciary would ordinarily be engaged before any trust is settled.</Disclaimer>
    </div>
  );
}

function Toggle({ label, a, b, value, onChange, note, disabled }: { label: string; a: string; b: string; value: boolean; onChange: (v: boolean) => void; note?: string; disabled?: boolean }) {
  return (
    <div className="tx-toggle">
      <div className="l">{label}</div>
      <div className="seg" role="radiogroup" aria-label={label}>
        <button className={value ? 'on' : ''} onClick={() => onChange(true)} disabled={disabled} aria-pressed={value}>{a}</button>
        <button className={!value ? 'on' : ''} onClick={() => onChange(false)} disabled={disabled} aria-pressed={!value}>{b}</button>
      </div>
      {note && <div className="note">{note}</div>}
    </div>
  );
}

function FlagRow({ f }: { f: Flag }) {
  return <div className="tx-flag"><ConfidenceChip level={f.level} short /><span>{f.text}</span></div>;
}

function Box({ x, y, title, sub, tone, w = BW, h = BH, onClick }: { x: number; y: number; title: string; sub?: string; tone?: string; w?: number; h?: number; onClick?: () => void }) {
  return (
    <g className={`tx-node ${tone ?? ''} ${onClick ? 'clickable' : ''}`} transform={`translate(${x} ${y})`} onClick={onClick}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} />
      <text y={sub ? -4 : 4} textAnchor="middle" className="t">{title}</text>
      {sub && <text y={12} textAnchor="middle" className="s">{sub}</text>}
    </g>
  );
}

function Arrow({ d, tone, dashed, faint, severed, label, labelAt, labelTone, flow = true }: { d: string; tone: string; dashed?: boolean; faint?: boolean; severed?: boolean; label?: string; labelAt?: { x: number; y: number }; labelTone?: string; flow?: boolean }) {
  // arrow head at path end — parse last coordinate pair and approximate direction from the preceding control point
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const ex = nums[nums.length - 2], ey = nums[nums.length - 1];
  const px = nums[nums.length - 4], py = nums[nums.length - 3];
  const ang = Math.atan2(ey - py, ex - px) * 180 / Math.PI;
  return (
    <g>
      <path d={d} className={`tx-edge ${tone} ${dashed ? 'dashed' : ''} ${faint ? 'faint' : ''} ${severed ? 'severed' : ''} ${flow && !faint && !severed ? 'flow-line' : ''}`} />
      {!severed && <polygon points="0,-4 8,0 0,4" className="tx-arrow" transform={`translate(${ex} ${ey}) rotate(${ang})`} style={{ fill: `var(--${tone === 'gold' ? 'gold' : tone === 'green' ? 'green-2' : tone})`, opacity: faint ? 0.3 : 1 }} />}
      {label && labelAt && <text x={labelAt.x} y={labelAt.y} textAnchor="middle" className={`tx-lbl ${labelTone ?? ''}`}>{label}</text>}
    </g>
  );
}

function Diagram({ cfg, assets, beneficiaries, protector, onToggleBens }: { cfg: TrustConfig; assets: string[]; beneficiaries: string[]; protector: boolean; onToggleBens: () => void }) {
  const dx = cfg.foreign ? FOREIGN_SHIFT : 0;
  const tx = 520 + dx, ty = 340, TW = 300, TH = 200;
  const left = tx - TW / 2, top = ty - TH / 2, bottom = ty + TH / 2;
  const trusteeX = 520 + dx, trusteeY = 90;
  const shown = assets.slice(0, 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="diagram tx-stage" aria-label="Trust architecture diagram">
      {/* foreign zone */}
      <rect x={300} y={10} width={W - 310} height={H - 20} rx={14} className={`tx-foreign-zone ${cfg.foreign ? 'on' : ''}`} />
      <line x1={300} x2={300} y1={14} y2={H - 14} className={`tx-border ${cfg.foreign ? 'on' : ''}`} />
      {cfg.foreign && <>
        <text x={310} y={30} className="tx-lbl amber" style={{ textAnchor: 'start', letterSpacing: '0.16em', fontSize: 9.5 }}>FOREIGN JURISDICTION · TRUST SITUS</text>
        <text x={290} y={30} className="tx-lbl" style={{ textAnchor: 'end', letterSpacing: '0.16em', fontSize: 9.5 }}>HOME JURISDICTION</text>
      </>}

      {/* Edges that live behind nodes */}
      {/* 1 transfer */}
      <Arrow d={`M ${SETTLOR.x + BW / 2} ${SETTLOR.y} Q ${left - 60} ${SETTLOR.y + 90} ${left} ${top + 30}`} tone="gold" label="transfer of assets · gift or sale" labelAt={{ x: (SETTLOR.x + left) / 2 + 10, y: SETTLOR.y + 62 }} />
      {/* 5 retained power — revocable vs cut */}
      {cfg.revocable
        ? <Arrow d={`M ${left + 20} ${top} Q ${left - 100} ${SETTLOR.y - 60} ${SETTLOR.x + BW / 2} ${SETTLOR.y - 14}`} tone="amber" dashed label="retained power to revoke / amend" labelAt={{ x: (SETTLOR.x + left) / 2 + 40, y: SETTLOR.y - 42 }} labelTone="amber" />
        : <g key={`cut-${cfg.foreign}`}>
          <Arrow d={`M ${left + 20} ${top} Q ${left - 100} ${SETTLOR.y - 60} ${SETTLOR.x + BW / 2} ${SETTLOR.y - 14}`} tone="amber" severed />
          <g className="tx-cut" transform={`translate(${(SETTLOR.x + left) / 2 + 30} ${SETTLOR.y - 30})`}>
            <line x1={-7} y1={-7} x2={7} y2={7} /><line x1={-7} y1={7} x2={7} y2={-7} />
          </g>
          <text x={(SETTLOR.x + left) / 2 + 30} y={SETTLOR.y - 46} textAnchor="middle" className="tx-lbl red">power to revoke cut · irrevocable</text>
        </g>}
      {/* 2 trustee → trust */}
      <Arrow d={`M ${trusteeX} ${trusteeY + BH / 2} L ${trusteeX} ${top}`} tone="blue" label="legal title · control over assets" labelAt={{ x: trusteeX + 96, y: (trusteeY + top) / 2 + 10 }} />
      {/* 3 protector → trustee */}
      {protector
        ? <Arrow d={`M ${PROTECTOR.x - BW / 2} ${PROTECTOR.y} L ${trusteeX + BW / 2} ${trusteeY}`} tone="blue" dashed label="oversight · power to remove / replace" labelAt={{ x: (PROTECTOR.x + trusteeX) / 2, y: PROTECTOR.y - 12 }} />
        : <Arrow d={`M ${PROTECTOR.x - BW / 2} ${PROTECTOR.y} L ${trusteeX + BW / 2} ${trusteeY}`} tone="blue" dashed faint label="no protector appointed" labelAt={{ x: (PROTECTOR.x + trusteeX) / 2, y: PROTECTOR.y - 12 }} flow={false} />}
      {/* 4 distributions */}
      <Arrow d={`M ${left} ${bottom - 20} Q ${left - 90} ${BENS.y - 60} ${BENS.x + BW / 2} ${BENS.y}`} tone="violet" dashed={cfg.discretionary} label={cfg.discretionary ? 'distributions · trustee discretion' : 'distributions · fixed % / mandatory income'} labelAt={{ x: (BENS.x + left) / 2 + 30, y: BENS.y + 4 }} />
      {cfg.discretionary && (
        <g className="tx-valve" transform={`translate(${left - 60} ${bottom + 10})`}>
          <rect x={-44} y={-11} width={88} height={22} rx={11} />
          <text textAnchor="middle" y={3}>discretion valve</text>
        </g>
      )}
      {/* 6 tax routing */}
      {cfg.grantor ? <>
        <Arrow d={`M ${left + 30} ${bottom} Q 270 330 ${SETTLOR.x + BW / 2} ${SETTLOR.y + 20}`} tone="red" dashed label="income attributed to settlor" labelAt={{ x: 300, y: 300 }} labelTone="red" />
        <Arrow d={`M ${SETTLOR.x} ${SETTLOR.y + BH / 2} L ${SETTLOR.x} ${TAX.y - BH / 2}`} tone="red" label="settlor's Form 1040" labelAt={{ x: SETTLOR.x, y: (SETTLOR.y + TAX.y) / 2 }} labelTone="red" />
      </> : (
        <Arrow d={`M ${left} ${ty - 10} L ${TAX.x + BW / 2} ${TAX.y - 10}`} tone="red" label="trust pays its own tax · Form 1041 · compressed brackets" labelAt={{ x: (TAX.x + left) / 2 + 30, y: TAX.y - 20 }} labelTone="red" />
      )}
      {/* 7 foreign reporting */}
      {cfg.foreign && <>
        <Arrow d={`M ${left} ${ty + 30} Q ${left - 80} ${TAX.y + 40} ${TAX.x + BW / 2} ${TAX.y + 16}`} tone="amber" dashed label="Form 3520 / 3520-A · FBAR where applicable" labelAt={{ x: (TAX.x + left) / 2 + 40, y: TAX.y + 44 }} labelTone="amber" />
        <Arrow d={`M ${BENS.x} ${BENS.y - BH / 2} L ${BENS.x} ${TAX.y + BH / 2}`} tone="amber" dashed label="Form 3520 on distributions" labelAt={{ x: BENS.x, y: (BENS.y + TAX.y) / 2 + 4 }} labelTone="amber" />
      </>}

      {/* Nodes */}
      <Box x={SETTLOR.x} y={SETTLOR.y} title="Settlor" sub={cfg.revocable ? 'retains control' : 'gives up control'} tone="gold" />
      <Box x={TAX.x} y={TAX.y} title="Home Tax Authority" sub={cfg.grantor ? 'taxes the settlor' : 'taxes the trust'} tone="red" />
      <Box x={BENS.x} y={BENS.y} title={`Beneficiaries (${beneficiaries.length})`} sub={beneficiaries.slice(0, 2).join(' · ') + (beneficiaries.length > 2 ? ' · …' : '')} tone="violet" onClick={onToggleBens} />
      <Box x={PROTECTOR.x} y={PROTECTOR.y} title="Protector" sub={protector ? 'oversight of trustee' : 'not appointed'} tone={protector ? 'blue' : undefined} />
      <g className="tx-trust" transform={`translate(${dx} 0)`}>
        <Box x={520} y={trusteeY} title="Trustee" sub={cfg.foreign ? 'licensed foreign trustee' : 'individual or corporate'} tone="blue" />
        <rect x={520 - TW / 2} y={top} width={TW} height={TH} rx={14} className="body" />
        <text x={520} y={top + 30} textAnchor="middle" className="title">The Trust</text>
        <text x={520} y={top + 46} textAnchor="middle" className="tx-lbl" style={{ fontSize: 9.5, letterSpacing: '0.14em' }}>{(cfg.revocable ? 'REVOCABLE' : 'IRREVOCABLE') + ' · ' + (cfg.grantor ? 'GRANTOR' : 'NON-GRANTOR')}</text>
        {shown.map((a, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          const ax = 520 - TW / 2 + 14 + col * 138, ay = top + 60 + row * 30;
          return (
            <g key={a} className="tx-asset" transform={`translate(${ax} ${ay})`}>
              <rect width={128} height={22} rx={11} />
              <text x={64} y={15} textAnchor="middle">{a.length > 20 ? a.slice(0, 19) + '…' : a}</text>
            </g>
          );
        })}
        {assets.length > 6 && <text x={520} y={top + 60 + 3 * 30 + 12} textAnchor="middle" className="tx-lbl">+{assets.length - 6} more assets</text>}
        <text x={520} y={bottom - 12} textAnchor="middle" className={`tx-lbl ${cfg.foreign ? 'amber' : ''}`} style={{ letterSpacing: '0.14em', fontSize: 9.5 }}>SITUS · {cfg.foreign ? 'FOREIGN JURISDICTION' : 'DOMESTIC'}{cfg.foreign ? ' · §679 FOR US SETTLORS WITH US BENEFICIARIES' : ''}</text>
      </g>
    </svg>
  );
}
