// ─────────────────────────────────────────────
//  src/components/FloorMap.jsx
//  MachineCard tile + MoldArea + Group + FloorMap
// ─────────────────────────────────────────────

import { KIND_SVG } from './MachineSvgs.jsx';
import { LAYOUT } from '../data/machines.js';

// ── helpers ──────────────────────────────────
function isVac(g) {
  return g && (
    (g.group  && /VACUUM/i.test(g.group))  ||
    (g.accent && /Vacuum/i.test(g.accent))
  );
}

// ── MoldArea ─────────────────────────────────
function MoldArea() {
  return (
    <div className="mold-rack-wrap" aria-hidden="true">
      <svg viewBox="0 0 90 96" preserveAspectRatio="xMidYMid meet" className="mold-rack">
        <rect x="6"  y="6"  width="16" height="58" fill="#fff" stroke="#3A4356" strokeWidth="1"/>
        <rect x="8"  y="9"  width="12" height="10" fill="#1B2433"/>
        <rect x="8"  y="21" width="12" height="10" fill="#1B2433"/>
        <rect x="8"  y="33" width="12" height="10" fill="#1B2433"/>
        <rect x="8"  y="45" width="12" height="10" fill="#1B2433"/>
        <rect x="68" y="6"  width="16" height="58" fill="#fff" stroke="#3A4356" strokeWidth="1"/>
        <rect x="70" y="9"  width="12" height="10" fill="#1B2433"/>
        <rect x="70" y="21" width="12" height="10" fill="#1B2433"/>
        <rect x="70" y="33" width="12" height="10" fill="#1B2433"/>
        <rect x="70" y="45" width="12" height="10" fill="#1B2433"/>
        <rect x="6"  y="70" width="78" height="18" fill="#fff" stroke="#3A4356" strokeWidth="1"/>
        <rect x="10" y="74" width="12" height="10" fill="#1B2433"/>
        <rect x="26" y="74" width="12" height="10" fill="#1B2433"/>
        <rect x="42" y="74" width="12" height="10" fill="#1B2433"/>
        <rect x="58" y="74" width="12" height="10" fill="#1B2433"/>
        <rect x="6"  y="6"  width="16" height="1.5" fill="#C8A96B"/>
        <rect x="68" y="6"  width="16" height="1.5" fill="#C8A96B"/>
        <rect x="6"  y="70" width="78" height="1.5" fill="#C8A96B"/>
      </svg>
    </div>
  );
}

// ── MachineCard ───────────────────────────────
export function MachineCard({ m, status, selected, onClick, kind }) {
  const Inner = KIND_SVG[kind] || KIND_SVG.forming;
  const vb = kind === 'transfer' ? '0 0 120 80' : '0 0 60 80';
  return (
    <div
      className={`vac-tile ${kind || 'forming'} ${status}${selected ? ' selected' : ''}`}
      onClick={onClick}
    >
      <div className="cap">{m.cap}T</div>
      <svg className="machine" viewBox={vb} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Inner />
      </svg>
      <div className="id">{m.id}</div>
      <span className="corner"></span>
    </div>
  );
}

// ── Group ─────────────────────────────────────
export function Group({ g, statuses, onSelect, selectedId, innerRef }) {
  const vac = isVac(g);
  return (
    <div className="group" style={g.moldArea ? { paddingTop:22, paddingBottom:22 } : null} ref={innerRef}>
      <div className="lbl">
        {g.group}
        {g.accent && <span className="accent">— {g.accent}</span>}
      </div>

      {g.moldArea ? <MoldArea /> : (
        <>
          <div className="tiles">
            {g.machines.map(m => (
              <MachineCard
                key={m.id}
                m={m}
                kind={g.kind || 'forming'}
                status={statuses[m.id]}
                selected={selectedId === m.id}
                onClick={() => onSelect(m)}
              />
            ))}
          </div>
          {vac && (
            <div className="vac-return">
              <span className="arrow">←</span>
              <span>Vacuum Return Line</span>
              <span className="arrow">→</span>
            </div>
          )}
        </>
      )}

      {!g.moldArea && !vac && (
        <span className="flow" aria-hidden="true">
          <svg viewBox="0 0 14 8">
            <path d="M0 4h11M8 1l4 3-4 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          flow
        </span>
      )}
    </div>
  );
}

// ── FloorMap ──────────────────────────────────
export function FloorMap({ statuses, onSelect, selectedId, mapWrapRef, rightClusterRef, desmaRef }) {
  // Group LAYOUT rows by row number
  const rows = {};
  LAYOUT.forEach(g => { (rows[g.row] || (rows[g.row] = [])).push(g); });

  return (
    <div className="map-wrap" ref={mapWrapRef}>
      <span className="ornament tl"/><span className="ornament tr"/>
      <span className="ornament bl"/><span className="ornament br"/>

      {/* Row 1 – INJECTION DESMA */}
      <div className="map-row r1">
        {rows[1].map((g, i) => (
          <Group key={i} g={g} statuses={statuses} onSelect={onSelect} selectedId={selectedId} innerRef={desmaRef}/>
        ))}
      </div>

      {/* Row 2 – C-line + Mold Area */}
      <div className="map-row r2">
        {rows[2].map((g, i) => (
          <Group key={i} g={g} statuses={statuses} onSelect={onSelect} selectedId={selectedId}
            innerRef={g.group === 'VACUUM' ? rightClusterRef : undefined}/>
        ))}
      </div>

      {/* Row 3 – B-line */}
      <div className="map-row r3">
        {rows[3].map((g, i) => (
          <Group key={i} g={g} statuses={statuses} onSelect={onSelect} selectedId={selectedId}/>
        ))}
      </div>

      {/* Row 4 – A/D line */}
      <div className="map-row r4">
        {rows[4].map((g, i) => (
          <Group key={i} g={g} statuses={statuses} onSelect={onSelect} selectedId={selectedId}/>
        ))}
      </div>
    </div>
  );
}
