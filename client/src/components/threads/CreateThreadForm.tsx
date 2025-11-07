import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { threadApi } from "../../lib/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const schema = z.object({
  initialValue: z.coerce.number({ invalid_type_error: "Enter a number" })
});

type FormValues = z.infer<typeof schema>;

type CreateThreadFormProps = {
  onCreated?: () => void;
};

export const CreateThreadForm = ({ onCreated }: CreateThreadFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      initialValue: 0
    }
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ initialValue }: FormValues) => threadApi.create(initialValue),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["threads"] });
      reset();
      onCreated?.();
    }
  });

  const onSubmit = handleSubmit((values: FormValues) => mutation.mutate(values));

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-brand-200 bg-white/70 p-6 shadow-sm md:flex-row md:items-end"
    >
      <div className="flex-1">
        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="initial-value">
          Start a new number discussion
        </label>
        <Input
          id="initial-value"
          type="number"
          step="any"
          placeholder="Enter starting number"
          {...register("initialValue", { valueAsNumber: true })}
        />
        {errors.initialValue && (
          <p className="mt-1 text-xs text-red-500">{errors.initialValue.message}</p>
        )}
      </div>
      <Button type="submit" className="md:w-auto" disabled={mutation.isPending}>
        {mutation.isPending ? "Publishing..." : "Publish starting number"}
      </Button>
    </form>
  );
};
