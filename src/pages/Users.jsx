import PageHeader from "../components/layout/PageHeader";
import Badge from "../components/ui/Badge";
import Select from "../components/ui/Select";
import EmptyState from "../components/ui/EmptyState";
import { TableSkeleton } from "../components/ui/Skeleton";
import { Table, THead, TH, TBody, TR, TD } from "../components/ui/Table";
import { useToast } from "../components/ui/Toast";
import { useUsers, useUserMutations } from "../hooks/useUsers";
import { useAuth } from "../context/AuthContext";
import { Users as UsersIcon } from "lucide-react";
import { formatDate, initialsOf, roleLabel } from "../utils/format";

const ROLES = ["admin", "manager", "technician"];

export default function Users() {
  const { data: users = [], isLoading } = useUsers();
  const { setRole } = useUserMutations();
  const { user } = useAuth();
  const toast = useToast();

  const changeRole = async (userId, role) => {
    try {
      await setRole.mutateAsync({ userId, role });
      toast.success("Role updated", roleLabel(role));
    } catch (e) {
      toast.error("Could not update role", e.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage team members and their access levels."
      />

      {isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" />
      ) : (
        <Table minWidth="640px">
          <THead>
            <TH>Member</TH>
            <TH>Current role</TH>
            <TH>Joined</TH>
            <TH className="w-48">Set role</TH>
          </THead>
          <TBody>
            {users.map((u) => {
              const isSelf = u.id === user?.id;
              return (
                <TR key={u.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">
                        {initialsOf(u.full_name) || "U"}
                      </span>
                      <span className="leading-tight">
                        <span className="block font-semibold text-ink-900">
                          {u.full_name || "Unnamed"}
                          {isSelf && (
                            <span className="ml-2 text-xs font-normal text-ink-400">
                              (you)
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-ink-400">
                          @{u.username}
                        </span>
                      </span>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={u.role === "admin" ? "solid" : "neutral"}>
                      {roleLabel(u.role)}
                    </Badge>
                  </TD>
                  <TD className="text-ink-500">{formatDate(u.created_at)}</TD>
                  <TD>
                    <Select
                      value={u.role}
                      disabled={isSelf || setRole.isPending}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {roleLabel(r)}
                        </option>
                      ))}
                    </Select>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
