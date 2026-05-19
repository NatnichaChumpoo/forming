// ─────────────────────────────────────────────
//  src/main.jsx
//  App entry point — mounts React root
// ─────────────────────────────────────────────
//  NOTE: Because this project uses Babel Standalone (no bundler),
//  all imports below are resolved at runtime via <script type="text/babel">.
//  Each file must also be served over HTTP (not file://).
// ─────────────────────────────────────────────

import { Dashboard } from './components/Dashboard.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(<Dashboard />);
