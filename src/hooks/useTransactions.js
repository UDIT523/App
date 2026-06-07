import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listTransactions,
  issuePart,
  deleteTransactions,
} from "../services/transactionsService";
import { useRealtime } from "./useRealtime";

const KEY = ["transactions"];

export function useTransactions() {
  useRealtime("transactions", KEY);
  return useQuery({ queryKey: KEY, queryFn: listTransactions });
}

export function useTransactionMutations() {
  const qc = useQueryClient();
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: ["inventory"] }); // stock changed
  };

  const issue = useMutation({ mutationFn: issuePart, onSuccess: invalidateAll });
  const remove = useMutation({
    mutationFn: deleteTransactions,
    onSuccess: invalidateAll,
  });

  return { issue, remove };
}
