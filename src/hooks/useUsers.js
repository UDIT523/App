import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listUsers, updateUserRole } from "../services/usersService";

const KEY = ["users"];

export function useUsers() {
  return useQuery({ queryKey: KEY, queryFn: listUsers });
}

export function useUserMutations() {
  const qc = useQueryClient();
  const setRole = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  return { setRole };
}
