import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuth } from "../../state/AuthProvider";

const schema = z.object({
  username: z.string().min(3, "Min 3 characters"),
  password: z.string().min(6, "Min 6 characters")
});

type FormValues = z.infer<typeof schema>;

type AuthDialogProps = {
  mode: "login" | "register";
  onClose: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
};

export const AuthDialog = ({ mode, onClose, onSwitchMode }: AuthDialogProps) => {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });
  const { login, register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data: FormValues) => {
    try {
      setSubmitting(true);
      setError(null);
      if (mode === "login") {
        await login(data);
      } else {
        await register(data);
      }
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <header className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login"
              ? "Enter your credentials to continue"
              : "Pick a unique username and a secure password"}
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="username">
              Username
            </label>
            <Input id="username" autoComplete="username" {...registerField("username")} />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              {...registerField("password")}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : mode === "login" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-brand-600 hover:text-brand-700"
            onClick={() => onSwitchMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </div>

        <button
          type="button"
          className="absolute right-3 top-3 rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-700"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
