import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';
import { useDirection } from '@/i18n/useDirection';

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
  useDirection();

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
