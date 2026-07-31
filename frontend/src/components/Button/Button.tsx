import { SHARED_CLASSES, VARIANT_STYLES } from './constants';
import type { ButtonProps } from './models';

export function Button({ type = 'button', variant = 'primary', pressed = false, className, ...rest }: ButtonProps) {
  const style = VARIANT_STYLES[variant];
  const classes = [
    SHARED_CLASSES,
    pressed ? style.pressedBackground : style.restBackground,
    style.text,
    style.interaction,
    style.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={classes} {...rest} />;
}
