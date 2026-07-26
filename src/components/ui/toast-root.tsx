import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToastStore } from '@/stores/toast-store';

/**
 * Renders the global toast queue inside a single <ToastProvider> +
 * <ToastViewport>. Mounted once at the app root (App.tsx) so toasts
 * survive route changes — fire a toast in the Wizard, navigate to
 * /profile, the toast keeps animating because the provider doesn't
 * unmount.
 *
 * Each toast's lifetime is driven by Radix's `duration` prop, which
 * triggers `onOpenChange(false)` after the timer elapses; the
 * onOpenChange handler dequeues the toast from the store.
 *
 * Swipe direction is 'down' to match the mobile-first bottom-docked
 * viewport (the toast.tsx docstring flags this as the natural
 * direction for a bottom-anchored toast).
 */
export function ToastRoot() {
  const toasts = useToastStore((s) => s.toasts);
  const dequeue = useToastStore((s) => s.dequeue);

  return (
    <ToastProvider swipeDirection="down">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          duration={toast.durationMs}
          onOpenChange={(open) => {
            if (!open) dequeue(toast.id);
          }}
        >
          <div className="flex flex-col gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? (
              <ToastDescription>{toast.description}</ToastDescription>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
