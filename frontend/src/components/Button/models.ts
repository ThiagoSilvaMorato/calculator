import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'muted';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  pressed?: boolean;
}

export interface VariantStyle {
  restBackground: string;
  pressedBackground: string;
  text: string;
  interaction: string;
  disabled: string;
}
