import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "muted";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  pressed?: boolean;
}

const SHARED_CLASSES =
  "cursor-pointer rounded-md px-5 py-2.5 font-semibold disabled:cursor-not-allowed";

interface VariantStyle {
  restBackground: string;
  pressedBackground: string;
  text: string;
  interaction: string;
  disabled: string;
}

const VARIANT_STYLES: Record<ButtonVariant, VariantStyle> = {
  primary: {
    restBackground: "bg-gray-700",
    pressedBackground: "bg-gray-900",
    text: "text-white",
    interaction: "hover:bg-gray-800 active:bg-gray-900",
    disabled: "disabled:bg-gray-300 disabled:text-gray-500",
  },
  secondary: {
    restBackground: "bg-gray-200",
    pressedBackground: "bg-gray-400",
    text: "text-gray-900",
    interaction: "hover:bg-gray-300 active:bg-gray-400",
    disabled: "disabled:bg-gray-100 disabled:text-gray-400",
  },
  muted: {
    restBackground: "bg-gray-400",
    pressedBackground: "bg-gray-600",
    text: "text-gray-900",
    interaction: "hover:bg-gray-500 active:bg-gray-600",
    disabled: "disabled:bg-gray-200 disabled:text-gray-400",
  },
};

export function Button({
  type = "button",
  variant = "primary",
  pressed = false,
  className,
  ...rest
}: ButtonProps) {
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
    .join(" ");

  return <button type={type} className={classes} {...rest} />;
}
