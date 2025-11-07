import { ForwardedRef, InputHTMLAttributes, forwardRef } from "react";

import { cn } from "../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...rest }: InputProps, ref: ForwardedRef<HTMLInputElement>) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200",
        className
      )}
      {...rest}
    />
  )
);

Input.displayName = "Input";
