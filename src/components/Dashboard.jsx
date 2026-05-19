// ─────────────────────────────────────────────
//  src/components/Dashboard.jsx
//  Root app component — wires all children together
// ─────────────────────────────────────────────

import { useState, useEffect, useMemo, useRef } from 'react';
import { LAYOUT } from '../data/machines.js';
import { seededRand, fmtTime } from '../utils/helpers.js';
import { Sidebar }      from './Sidebar.jsx';
import { FloorMap }     from './FloorMap.jsx';
import { MachineModal } from './MachineModal.jsx';

// ── Deterministic initial statuses (seed = 7) ──
function initialStatuses() {
  const r    = seededRand(7);
  const dist = [
    ...Array(36).fill('running'),
    ...Array(1).fill('down'),
    ...Array(1).fill('manpower'),
    ...Array(7).fill('plan'),
  ];
  const all  = LAYOUT.flatMap(g => g.machines.map(m => m.id));
  while (dist.length < all.length) dist.push('running');
  for (let i = dist.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [dist[i], dist[j]] = [dist[j], dist[i]];
  }
  const out = {};
  all.forEach((id, i) => { out[id] = dist[i] || 'running'; });
  return out;
}

export function Dashboard() {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [partNos,  setPartNos]  = useState({});
  const [selected, setSelected] = useState(null);       // selected machine id
  const [now,      setNow]      = useState(new Date());

  const rightClusterRef = useRef(null);
  const desmaRef        = useRef(null);
  const mapWrapRef      = useRef(null);

  // Tick clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Align DESMA group to right edge of map
  useEffect(() => {
    function align() {
      const wrap = mapWrapRef.current, vacu = rightClusterRef.current, desma = desmaRef.current;
      if (!wrap || !vacu || !desma) return;
      const wr = wrap.getBoundingClientRect(), vr = vacu.getBoundingClientRect();
      desma.style.marginRight = (wr.right - vr.right) + 'px';
    }
    requestAnimationFrame(align);
    window.addEventListener('resize', align);
    return () => window.removeEventListener('resize', align);
  }, []);

  // Status counts
  const counts = useMemo(() => {
    const c = {running:0,down:0,setup:0,damage:0,qa:0,material:0,manpower:0,plan:0};
    Object.values(statuses).forEach(s => { c[s] = (c[s] || 0) + 1; });
    return c;
  }, [statuses]);

  const total = Object.keys(statuses).length;

  // Resolve selected machine metadata
  const selectedMachine = selected && (() => {
    for (const g of LAYOUT) {
      const m = g.machines.find(mm => mm.id === selected);
      if (m) return { ...m, zone: g.group + (g.accent ? ' · ' + g.accent : '') };
    }
    return null;
  })();

  return (
    <>
      {/* ── Top bar ── */}
      <div className="topbar">
        <div className="brand">
          <div className="crest">F</div>
          <div>
            <h1>Forming Operations · Plant 04</h1>
            <div className="sub">Status Forming Machine · Shift A · Day 1</div>
          </div>
        </div>
        <div className="top-right">
          <div className="live"><span className="dot"></span> Live · MES sync 3s</div>
          <div className="meta-block">
            <span className="k">System Time</span>
            <span className="v">{fmtTime(now)}</span>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="main">
        <Sidebar
          counts={counts}
          total={total}
          statuses={statuses}
          partNos={partNos}
          setStatuses={setStatuses}
          setPartNos={setPartNos}
        />

        <div className="col center">
          <div className="panel-title" style={{ marginBottom:14 }}>
            <span className="t">Forming Floor · Live Map</span>
            <span className="n">II</span>
          </div>
          <FloorMap
            statuses={statuses}
            onSelect={m => setSelected(m.id)}
            selectedId={selected}
            mapWrapRef={mapWrapRef}
            rightClusterRef={rightClusterRef}
            desmaRef={desmaRef}
          />
        </div>
      </div>

      {/* ── Machine detail modal ── */}
      {selectedMachine && (
        <MachineModal
          machine={selectedMachine}
          status={statuses[selectedMachine.id]}
          partNo={partNos[selectedMachine.id] || '—'}
          onClose={() => setSelected(null)}
          onChange={ns => setStatuses(prev => ({ ...prev, [selectedMachine.id]: ns }))}
          now={now}
        />
      )}
    </>
  );
}
