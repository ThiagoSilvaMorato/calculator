import type { ButtonVariant, VariantStyle } from './models';

export const SHARED_CLASSES = 'cursor-pointer rounded-md px-5 py-2.5 font-semibold disabled:cursor-not-allowed';

export const VARIANT_STYLES: Record<ButtonVariant, VariantStyle> = {
  primary: {
    restBackground: 'bg-gray-700',
    pressedBackground: 'bg-gray-900',
    text: 'text-white',
    interaction: 'hover:bg-gray-800 active:bg-gray-900',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500',
  },
  secondary: {
    restBackground: 'bg-gray-200',
    pressedBackground: 'bg-gray-400',
    text: 'text-gray-900',
    interaction: 'hover:bg-gray-300 active:bg-gray-400',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-400',
  },
  muted: {
    restBackground: 'bg-gray-400',
    pressedBackground: 'bg-gray-600',
    text: 'text-gray-900',
    interaction: 'hover:bg-gray-500 active:bg-gray-600',
    disabled: 'disabled:bg-gray-200 disabled:text-gray-400',
  },
};
