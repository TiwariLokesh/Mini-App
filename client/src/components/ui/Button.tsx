import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
  secondary:
    "bg-slate-100 hover:bg-slate-200 text-slate-900 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400",
  ghost: "bg-transparent text-brand-600 hover:text-brand-700"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  props: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) => {
  const { className, variant = "primary", type = "button", ...rest } = props;
  const resolvedVariant: ButtonVariant = variant ?? "primary";
  const variantClass = variantClasses[resolvedVariant];
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
        variantClass,
        className
      )}
      {...rest}
    />
  );
});

Button.displayName = "Button";
