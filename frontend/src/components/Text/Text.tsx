import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'label' | 'strong';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  children: ReactNode;
}

const BASE_CLASSES = 'm-0 text-inherit';

export function Text({ as, className, children, ...rest }: TextProps) {
  const Component = (as ?? 'p') as ElementType;
  const classes = [BASE_CLASSES, className].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
