import type { HTMLAttributes, ReactNode } from 'react';

export type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'label' | 'strong';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  children: ReactNode;
}
