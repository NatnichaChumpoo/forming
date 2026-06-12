// ─────────────────────────────────────────────
//  src/components/MachineModal.jsx
//  Detail modal — shows machine info & status picker
// ─────────────────────────────────────────────


function MachineModal({ machine, status, partNo, remark, onClose, now }) {
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-head">
          <div className="crumb">Machine Detail · Live</div>
          <div className="id-line">
            <div className="id">{machine.displayId || machine.id}</div>
            <div className="cap">{machine.cap} T</div>
            <div className="zone">{machine.zone}</div>
          </div>
          <button className="close" onClick={onClose} aria-label="close">×</button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          <div className="field">
            <span className="k">Current Status</span>
            <span className="v" style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:10, height:10, borderRadius:2, background:stVar(status) }}/>
              {(statusByKey[status] || statusByKey['running']).name}
            </span>
          </div>

          <div className="field">
            <span className="k">Last Updated</span>
            <span className="v">{shortTime(now)}</span>
          </div>

          <div className="field">
            <span className="k">Zone</span>
            <span className="v">{machine.zone}</span>
          </div>

          <div className="field">
            <span className="k">Capacity</span>
            <span className="v">{machine.cap} Tonnage</span>
          </div>

          <div className="field">
            <span className="k">Part No.</span>
            <span className="v">{partNo}</span>
          </div>

          <div className="field">
            <span className="k">M/C Type</span>
            <span className="v">{(MC_META[machine.id] || {}).type || '—'}</span>
          </div>

          <div className="field full">
            <span className="k">Remark</span>
            <textarea
              className="remark"
              value={remark || ''}
              placeholder={REMARKS[status]}
              readOnly
              rows={3}
            />
          </div>

          {/* ── Status (read-only) ── */}
          <div className="status-selector">
            <div className="lbl">
              <span>Status</span>
              <span className="lock-hint">🔒 View only · แก้ไขได้ที่ Edit Layout</span>
            </div>
            <div className="status-grid locked">
              {STATUSES.map(s => (
                <div
                  key={s.key}
                  className={`status-opt readonly ${status === s.key ? 'active' : ''}`}
                >
                  <span className="dot" style={{ background: stVar(s.key) }}/>
                  <span className="nm">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="modal-foot">
          <div className="left">Audit log · {machine.displayId || machine.id} · {shortTime(now)}</div>
        </div>

      </div>
    </div>
  );
}