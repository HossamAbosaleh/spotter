import * as React from 'react';
import { Slider as SliderPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Slider — Spotter-customized shadcn primitive built on Radix Slider.
 *
 * Customizations from upstream shadcn Slider:
 * - Track color: `bg-bg-elevated` (= `#1c1c1f`). Lifts the rail above
 *   page canvas; the unfilled portion reads as "data area," not as
 *   missing pixels.
 * - Range (filled portion) color: `bg-accent-primary` (lime).
 * - Thumb visual: `size-5` filled circle with a 2px lime border on
 *   `bg-bg-canvas`. The dark fill keeps the lime ring readable as a
 *   discrete handle rather than a glowing dot.
 * - Track height: `h-2` (8px) horizontal / `w-2` vertical. Slightly
 *   chunkier than upstream `h-1.5` for thumb-friendlier grabbing.
 * - Motion: `duration-micro ease-standard` on thumb hover/focus
 *   transitions.
 * - Multi-thumb: derives the number of thumbs from `value` /
 *   `defaultValue` arrays (same pattern as upstream).
 *
 * **Touch target note**: the thumb is 20px. Sliders are dragged
 * along the rail rather than tapped at a discrete location, so the
 * effective target is the rail length plus thumb diameter. For Spotter
 * this is acceptable on mobile because Radix listens to clicks on the
 * track and snaps the nearest thumb to the click point — the user
 * doesn't need to land precisely on the thumb. If the wizard ever
 * adopts a slider for a critical numeric value (RPE picker?) and
 * mobile usability proves marginal, revisit the rail height.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const thumbValues = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      {...(defaultValue !== undefined && { defaultValue })}
      {...(value !== undefined && { value })}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'relative grow overflow-hidden rounded-full bg-bg-elevated',
          'data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full',
          'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2'
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'absolute bg-accent-primary',
            'data-[orientation=horizontal]:h-full',
            'data-[orientation=vertical]:w-full'
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbValues.length }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          className={cn(
            'block size-5 shrink-0 rounded-full border-2 border-accent-primary bg-bg-canvas shadow-subtle',
            'outline-none transition-colors duration-micro ease-standard',
            'hover:bg-bg-elevated',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
