// ─────────────────────────────────────────────
//  src/components/MachineModal.jsx
//  Detail modal — shows machine info & status picker
// ─────────────────────────────────────────────


function MachineModal({ machine, status, partNo, remark, onClose, onChange, onRemarkChange, now }) {
  const [draft,       setDraft]       = useState(status);
  const [draftRemark, setDraftRemark] = useState(remark || '');

  useEffect(() => setDraft(status), [status, machine.id]);
  useEffect(() => setDraftRemark(remark || ''), [machine.id]);

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
              <span style={{ width:10, height:10, borderRadius:2, background:stVar(draft) }}/>
              {statusByKey[draft].name}
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
              value={draftRemark}
              placeholder={REMARKS[draft]}
              onChange={e => setDraftRemark(e.target.value)}
              rows={3}
            />
          </div>

          {/* ── Status picker ── */}
          <div className="status-selector">
            <div className="lbl">Reassign Status</div>
            <div className="status-grid">
              {STATUSES.map(s => (
                <button
                  key={s.key}
                  className={`status-opt ${draft === s.key ? 'active' : ''}`}
                  onClick={() => setDraft(s.key)}
                >
                  <span className="dot" style={{ background: stVar(s.key) }}/>
                  <span className="nm">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="modal-foot">
          <div className="left">Audit log · {machine.displayId || machine.id} · {shortTime(now)}</div>
          <div className="actions">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={() => { onChange(draft); onRemarkChange(draftRemark); onClose(); }}>
              Apply Change
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
