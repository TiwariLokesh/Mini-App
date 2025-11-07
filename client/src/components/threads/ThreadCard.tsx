import { useState } from "react";

import type { ThreadNode } from "../../types";
import { formatDateTime } from "../../utils/format";
import { Button } from "../ui/Button";
import { OperationForm } from "./OperationForm";
import { OperationNodeCard } from "./OperationNodeCard";

type ThreadCardProps = {
  thread: ThreadNode;
  canRespond: boolean;
};

export const ThreadCard = ({ thread, canRespond }: ThreadCardProps) => {
  const [isAddingOperation, setAddingOperation] = useState(false);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <span className="font-semibold text-slate-700">{thread.author.username}</span>
            <span>•</span>
            <span>{formatDateTime(thread.createdAt)}</span>
          </div>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">
            Starting number: <span className="font-mono">{thread.initialValue}</span>
          </h3>
        </div>
        {canRespond && (
          <Button variant="secondary" onClick={() => setAddingOperation((prev) => !prev)}>
            {isAddingOperation ? "Close" : "Respond"}
          </Button>
        )}
      </header>

      {isAddingOperation && canRespond && (
        <div className="mt-4">
          <OperationForm
            threadId={thread.id}
            parentOperationId={null}
            onCreated={() => setAddingOperation(false)}
            onCancel={() => setAddingOperation(false)}
          />
        </div>
      )}

      <section className="mt-6 space-y-4">
        {thread.operations.length === 0 ? (
          <p className="text-sm text-slate-500">No operations yet. Be the first to respond!</p>
        ) : (
          <ul className="space-y-6">
            {thread.operations.map((operation) => (
              <OperationNodeCard key={operation.id} node={operation} canRespond={canRespond} />
            ))}
          </ul>
        )}
      </section>
    </article>
  );
};
