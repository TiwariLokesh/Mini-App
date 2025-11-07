import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { threadApi } from "../../lib/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const schema = z.object({
  operationType: z.enum(["add", "subtract", "multiply", "divide"]),
  operand: z.coerce.number({ invalid_type_error: "Enter a number" })
});

type FormValues = z.infer<typeof schema>;

type OperationFormProps = {
  threadId: number;
  parentOperationId: number | null;
  onCreated?: () => void;
  onCancel?: () => void;
};

export const OperationForm = ({
  threadId,
  parentOperationId,
  onCreated,
  onCancel
}: OperationFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      operationType: "add",
      operand: 0
    }
  });
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      threadApi.createOperation({
        threadId,
        parentOperationId,
        operationType: data.operationType,
        operand: data.operand
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["threads"] });
      reset();
      setServerError(null);
      onCreated?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to add operation";
      setServerError(message);
    }
  });

  const onSubmit = handleSubmit((data: FormValues) => mutation.mutate(data));

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white/70 p-4 text-sm shadow-inner">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-slate-600">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide">Operation</span>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            {...register("operationType")}
          >
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
            <option value="multiply">Multiply</option>
            <option value="divide">Divide</option>
          </select>
        </label>

        <label className="text-slate-600">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide">Operand</span>
          <Input type="number" step="any" {...register("operand", { valueAsNumber: true })} />
          {errors.operand && <p className="mt-1 text-xs text-red-500">{errors.operand.message}</p>}
        </label>
      </div>

      {serverError && <p className="text-xs text-red-500">{serverError}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel} disabled={mutation.isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Adding..." : "Add operation"}
        </Button>
      </div>
    </form>
  );
};
