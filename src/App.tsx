import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Direction } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import Landing from '@/pages/Landing';
import DesignShowcase from '@/pages/Design';
import Setup from '@/pages/Setup';
import Profile from '@/pages/Profile';
import { ProfileGuard } from '@/components/profile/profile-guard';
import { ToastRoot } from '@/components/ui/toast-root';
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
  const { i18n } = useTranslation();
  const dir = i18n.language?.startsWith('ar') ? 'rtl' : 'ltr';

  return (
    // Radix primitives (RadioGroup.Root, Toast.Provider, Menu, …) read
    // direction from their own DirectionContext, NOT from `<html dir>`.
    // Without this provider Radix defaults to "ltr" and overrides the
    // html-level direction on its rendered Root elements — which means
    // the RadioGroup's inner `<label>` wrappers inherit LTR layout and
    // don't flip in AR. Mounting the provider once here lets every
    // Radix consumer in the app honor the active locale.
    <Direction.DirectionProvider dir={dir}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ProfileGuard>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/profile" element={<Profile />} />
            {import.meta.env.DEV ? (
              <Route path="/_design" element={<DesignShowcase />} />
            ) : null}
          </Routes>
        </ProfileGuard>
      </BrowserRouter>
      <ToastRoot />
    </Direction.DirectionProvider>
  );
}

export default App;
