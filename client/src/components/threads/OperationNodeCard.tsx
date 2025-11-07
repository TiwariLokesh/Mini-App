import { useState } from "react";

import { formatDateTime, formatOperation } from "../../utils/format";
import type { OperationNode } from "../../types";
import { Button } from "../ui/Button";
import { OperationForm } from "./OperationForm";

type OperationNodeCardProps = {
  node: OperationNode;
  canRespond: boolean;
};

export const OperationNodeCard = ({ node, canRespond }: OperationNodeCardProps) => {
  const [isReplying, setReplying] = useState(false);

  return (
    <li className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
              <span className="font-semibold text-slate-700">{node.author.username}</span>
              <span>•</span>
              <span>{formatDateTime(node.createdAt)}</span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-sm text-slate-500">{formatOperation(node.operationType, node.operand)}</div>
              <div className="font-mono text-lg font-semibold text-slate-900">= {node.result}</div>
            </div>
          </div>
          {canRespond && (
            <Button variant="ghost" onClick={() => setReplying((prev) => !prev)}>
              {isReplying ? "Close" : "Respond"}
            </Button>
          )}
        </div>
        {isReplying && canRespond && (
          <div className="mt-4">
            <OperationForm
              threadId={node.threadId}
              parentOperationId={node.id}
              onCreated={() => setReplying(false)}
              onCancel={() => setReplying(false)}
            />
          </div>
        )}
      </div>

      {node.children.length > 0 && (
        <ul className="space-y-4 border-l border-dashed border-slate-200 pl-6">
          {node.children.map((child) => (
            <OperationNodeCard key={child.id} node={child} canRespond={canRespond} />
          ))}
        </ul>
      )}
    </li>
  );
};
