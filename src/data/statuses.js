// ─────────────────────────────────────────────
//  src/data/statuses.js
//  Status definitions, labels, and import maps
// ─────────────────────────────────────────────

export const STATUSES = [
  {key:'running',  name:'Running',         desc:'Operating within tolerance'},
  {key:'down',     name:'Machine Down',    desc:'Unplanned mechanical fault'},
  {key:'setup',    name:'Mold Setup',      desc:'Tooling changeover in progress'},
  {key:'damage',   name:'Mold Damage',     desc:'Tool integrity compromised'},
  {key:'qa',       name:'Quality Problem', desc:'Output flagged by inspection'},
  {key:'material', name:'NO Material',     desc:'Resin / compound shortage'},
  {key:'manpower', name:'NO Manpower',     desc:'Operator unassigned'},
  {key:'plan',     name:'NO Plan',         desc:'No production scheduled'},
];

export const statusByKey = Object.fromEntries(STATUSES.map(s => [s.key, s]));

export const STATUS_EXPORT_NAME = {
  running:'Running', down:'Machine Down', setup:'Mold Setup', damage:'Mold Damage',
  qa:'Quality Problem', material:'NO Material', manpower:'NO Manpower', plan:'NO Plan',
};

// maps lowercase Excel cell values → internal status key
export const IMPORT_STATUS_MAP = {
  'running':'running','machine down':'down','mold setup':'setup','mold damage':'damage',
  'quality problem':'qa','no material':'material','no manpower':'manpower','no plan':'plan',
};

export const REMARKS = {
  running:  'Cycle stable. Cavity pressure nominal. Operator on station.',
  down:     'E-stop triggered at 09:42. Maintenance dispatched. ETA 25 min.',
  setup:    'Mold M-3217 staged. Calibration pass in progress.',
  damage:   'Vent erosion observed on cavity 4. Awaiting tooling review.',
  qa:       'Inspection lot held. Dimensional variance on flange OD.',
  material: 'PP-H feed depleted on hopper B. Replenishment requested.',
  manpower: 'No operator assigned for current shift. Roster update pending.',
  plan:     'No production order scheduled in MES window 08:00–20:00.',
};
