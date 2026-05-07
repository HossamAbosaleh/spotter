import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Custom font-size classes from tailwind.config.ts
      'font-size': [
        {
          text: [
            'display-lg',
            'display-md',
            'h1',
            'h2',
            'h3',
            'body-lg',
            'body',
            'body-sm',
            'caption',
            'mono-xl',
            'mono-lg',
            'mono',
            'mono-sm',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
