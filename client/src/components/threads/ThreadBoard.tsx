import { useQuery } from "@tanstack/react-query";

import { threadApi } from "../../lib/api";
import { useAuth } from "../../state/AuthProvider";
import { Button } from "../ui/Button";
import { CreateThreadForm } from "./CreateThreadForm";
import { ThreadCard } from "./ThreadCard";

export const ThreadBoard = () => {
  const { user, isReady } = useAuth();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useQuery({
    queryKey: ["threads"],
    queryFn: () => threadApi.list(),
    refetchInterval: 5000
  });

  const threads = data?.threads ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Number Dialogues</h1>
          <p className="text-sm text-slate-500">
            Explore how operations evolve starting numbers into vibrant conversations.
          </p>
        </div>
        <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {user && isReady && <CreateThreadForm />}

      {!isReady && <p className="text-slate-500">Checking authentication...</p>}

      {isLoading ? (
        <p className="text-slate-500">Loading threads...</p>
      ) : isError ? (
        <p className="text-red-500">Failed to load discussions. Try refreshing.</p>
      ) : threads.length === 0 ? (
        <p className="text-slate-500">No discussions yet. Start the first one!</p>
      ) : (
        <div className="space-y-8">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} canRespond={Boolean(user)} />
          ))}
        </div>
      )}
    </div>
  );
};
