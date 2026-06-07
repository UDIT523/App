import { useMemo, useState } from "react";
import {
  Download,
  Copy,
  Trash2,
  Search,
  History,
  FileText,
} from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { TableSkeleton } from "../components/ui/Skeleton";
import { Table, THead, TH, TBody, TR, TD } from "../components/ui/Table";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { useTransactions, useTransactionMutations } from "../hooks/useTransactions";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";
import { exportTransactions } from "../utils/excel";
import { transactionsToCSV } from "../utils/csv";

export default function Transactions() {
  const { data: rows = [], isLoading } = useTransactions();
  const { remove } = useTransactionMutations();
  const { can } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());

  const canDelete = can("transactions:delete");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((t) =>
      [t.part_name, t.machine, t.sub_machine, t.given_to].some((v) =>
        (v || "").toLowerCase().includes(q)
      )
    );
  }, [rows, query]);

  const allSelected = filtered.length > 0 && selected.size === filtered.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map((t) => t.id)));
  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDelete = async () => {
    if (selected.size === 0) return;
    const ok = await confirm({
      title: "Delete transactions?",
      message: `${selected.size} transaction(s) will be permanently removed. This does not restore stock.`,
      destructive: true,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await remove.mutateAsync([...selected]);
      toast.success("Deleted", `${selected.size} transaction(s) removed`);
      setSelected(new Set());
    } catch (e) {
      toast.error("Delete failed", e.message);
    }
  };

  const handleCopy = async () => {
    if (rows.length === 0) return toast.info("Nothing to copy");
    try {
      await navigator.clipboard.writeText(transactionsToCSV(rows));
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="A complete history of every issued part."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleCopy} aria-label="Copy CSV">
              <Copy className="h-4 w-4" /> <span className="hidden md:inline">Copy CSV</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                rows.length
                  ? exportTransactions(rows)
                  : toast.info("Nothing to export")
              }
              aria-label="Export to Excel"
            >
              <Download className="h-4 w-4" /> <span className="hidden md:inline">Export</span>
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Badge variant="outline">{rows.length} transactions</Badge>
        <div className="w-full sm:w-72">
          <Input
            icon={Search}
            placeholder="Search part, recipient…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {canDelete && selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-2.5 animate-fade-in">
          <span className="text-sm font-medium text-ink-700">
            {selected.size} selected
          </span>
          <Button variant="dangerGhost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete selected
          </Button>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title={query ? "No matching transactions" : "No transactions yet"}
          description={
            query
              ? "Try a different search."
              : "Issued parts will appear here."
          }
        />
      ) : (
        <Table minWidth="820px">
          <THead>
            {canDelete && (
              <TH className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer accent-ink-900"
                  aria-label="Select all"
                />
              </TH>
            )}
            <TH>Spare part</TH>
            <TH>Machine</TH>
            <TH>Sub-machine</TH>
            <TH>Given to</TH>
            <TH className="text-right">Qty</TH>
            <TH>Date</TH>
            <TH className="w-16">Invoice</TH>
          </THead>
          <TBody>
            {filtered.map((t) => (
              <TR key={t.id}>
                {canDelete && (
                  <TD>
                    <input
                      type="checkbox"
                      checked={selected.has(t.id)}
                      onChange={() => toggleRow(t.id)}
                      className="h-4 w-4 cursor-pointer accent-ink-900"
                      aria-label={`Select transaction ${t.id}`}
                    />
                  </TD>
                )}
                <TD className="font-semibold text-ink-900">{t.part_name}</TD>
                <TD className="text-ink-600">{t.machine}</TD>
                <TD className="text-ink-600">{t.sub_machine}</TD>
                <TD className="text-ink-600">{t.given_to}</TD>
                <TD className="text-right font-semibold tabular-nums">
                  {t.quantity}
                </TD>
                <TD className="whitespace-nowrap text-ink-500">
                  {formatDate(t.issue_date)}
                </TD>
                <TD>
                  {t.invoice_url ? (
                    <a
                      href={t.invoice_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-ink-900 underline-offset-2 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-ink-300">—</span>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
