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

  const {
    setRole,
    approve,
    reject,
  } = useUserMutations();

  const { user } = useAuth();
  const toast = useToast();

  const pendingUsers = users.filter(
    (u) => u.status === "pending"
  );

  const approvedUsers = users.filter(
    (u) => u.status === "approved"
  );

  const changeRole = async (userId, role) => {
    try {
      await setRole.mutateAsync({ userId, role });
      toast.success("Role updated", roleLabel(role));
    } catch (e) {
      toast.error("Could not update role", e.message);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approve.mutateAsync(userId);
      toast.success("User approved");
    } catch (e) {
      toast.error("Approval failed", e.message);
    }
  };

  const handleReject = async (userId) => {
    try {
      await reject.mutateAsync(userId);
      toast.success("User rejected");
    } catch (e) {
      toast.error("Rejection failed", e.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage team members and their access levels."
      />

      {pendingUsers.length > 0 && (
        <div className="mb-8 rounded-xl border bg-white p-5">
          <h3 className="mb-4 text-lg font-semibold">
            Pending Account Requests
          </h3>

          <div className="space-y-3">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <div className="font-semibold">
                    {u.full_name}
                  </div>

                  <div className="text-sm text-gray-500">
                    @{u.username}
                  </div>
                </div>

                <div className="flex gap-2">
  <button
    onClick={() => handleApprove(u.id)}
    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
  >
    Approve
  </button>

  <button
    onClick={() => handleReject(u.id)}
    className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
  >
    Remove
  </button>
</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : approvedUsers.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No approved users found" />
      ) : (
        <Table minWidth="640px">
          <THead>
            <TH>Member</TH>
            <TH>Current Role</TH>
            <TH>Joined</TH>
            <TH>Status</TH>
            <TH className="w-48">Set Role</TH>
          </THead>

          <TBody>
            {approvedUsers.map((u) => {
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
                    <Badge
                      variant={
                        u.role === "admin"
                          ? "solid"
                          : "neutral"
                      }
                    >
                      {roleLabel(u.role)}
                    </Badge>
                  </TD>

                  <TD className="text-ink-500">
                    {formatDate(u.created_at)}
                  </TD>

                  <TD>
                    <Badge variant="solid">
                      Approved
                    </Badge>
                  </TD>

                  <TD>
                    <Select
                      value={u.role}
                      disabled={
                        isSelf ||
                        setRole.isPending
                      }
                      onChange={(e) =>
                        changeRole(
                          u.id,
                          e.target.value
                        )
                      }
                    >
                      {ROLES.map((r) => (
                        <option
                          key={r}
                          value={r}
                        >
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