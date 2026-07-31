import type { ElementType } from 'react';
import { BASE_CLASSES } from './constants';
import type { TextProps } from './models';

export function Text({ as, className, children, ...rest }: TextProps) {
  const Component = (as ?? 'p') as ElementType;
  const classes = [BASE_CLASSES, className].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
