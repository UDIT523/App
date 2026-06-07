import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

/**
 * Subscribe to Postgres changes on a table and invalidate the given query key
 * so TanStack Query refetches. Keeps every open client in sync in realtime.
 */
export function useRealtime(table, queryKey) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => queryClient.invalidateQueries({ queryKey })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
}
