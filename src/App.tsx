import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';

/**
 * Spotter App root.
 *
 * In Phase P0, this is intentionally minimal — just a landing page so the
 * project runs end-to-end. Pages and routes are added in subsequent phases:
 * - P1 → /setup (profile wizard)
 * - P2 → /library
 * - P3 → /prompt (prompt generator)
 * - P4 → /workout (daily view)
 * etc.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
