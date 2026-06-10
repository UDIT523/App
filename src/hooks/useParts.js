import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listInventory,
  addOrUpdatePart,
  updatePart,
  deleteInventoryRows,
  importParts,
  receiveStock,
} from "../services/partsService";
import { useRealtime } from "./useRealtime";

const KEY = ["inventory"];

export function useInventory() {
  useRealtime("parts", KEY);
  useRealtime("part_usages", KEY);
  return useQuery({ queryKey: KEY, queryFn: listInventory });
}

export function usePartMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const add = useMutation({ mutationFn: addOrUpdatePart, onSuccess: invalidate });
  const edit = useMutation({
    mutationFn: ({ partId, ...fields }) => updatePart(partId, fields),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteInventoryRows,
    onSuccess: invalidate,
  });
  const importMany = useMutation({
    mutationFn: importParts,
    onSuccess: invalidate,
  });

  const receiveMany = useMutation({
  mutationFn: receiveStock,
  onSuccess: invalidate,
  });

  return { add, edit, remove, importMany ,receiveMany, };
}
