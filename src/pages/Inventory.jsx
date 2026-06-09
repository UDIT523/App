import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Download,
  Upload,
  Copy,
  ClipboardPaste,
  Trash2,
  Search,
  Package,
  Pencil,
  AlertTriangle,
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
import PartFormModal from "../components/inventory/PartFormModal";
import { useInventory, usePartMutations } from "../hooks/useParts";
import { useAuth } from "../context/AuthContext";
import { isLowStock, formatDate } from "../utils/format";
import {
  exportInventory,
  parseInventoryFile,
} from "../utils/excel";
import {
  inventoryToCSV,
  parseInventoryCSV,
} from "../utils/csv";

export default function Inventory() {
  const { data: rows = [], isLoading } = useInventory();
  const { remove, importMany } = usePartMutations();
  const { can } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const fileRef = useRef(null);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const canWrite = can("inventory:write");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.machine, r.subMachine].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [rows, query]);

  const lowCount = useMemo(() => rows.filter(isLowStock).length, [rows]);

  const allSelected = filtered.length > 0 && selected.size === filtered.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map((r) => r.usageId)));
  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openAdd = () => {
    setEditRow(null);
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditRow(row);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (selected.size === 0) {
      toast.info("Select rows to delete first");
      return;
    }
    const ok = await confirm({
      title: "Delete selected rows?",
      message: `${selected.size} inventory row(s) will be removed. Parts with no remaining machine usage are deleted entirely.`,
      destructive: true,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await remove.mutateAsync(filtered.filter((r) => selected.has(r.usageId)));
      toast.success("Deleted", `${selected.size} row(s) removed`);
      setSelected(new Set());
    } catch (e) {
      toast.error("Delete failed", e.message);
    }
  };

  const handleExport = () => {
    if (rows.length === 0) return toast.info("Nothing to export");
    exportInventory(rows);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseInventoryFile(file);
      const count = await importMany.mutateAsync(parsed);
      toast.success("Import complete", `${count} part rows processed`);
    } catch (err) {
      toast.error("Import failed", err.message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCopy = async () => {
    if (rows.length === 0) return toast.info("Nothing to copy");
    try {
      await navigator.clipboard.writeText(inventoryToCSV(rows));
      toast.success("Copied", "Inventory CSV is on your clipboard");
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseInventoryCSV(text);
      const count = await importMany.mutateAsync(parsed);
      toast.success("Pasted", `${count} part rows processed`);
    } catch (err) {
      toast.error("Paste failed", err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track spare parts and stock across machines."
        actions={
          canWrite && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImport}
              />
              <Button variant="secondary" size="sm" onClick={handleCopy} aria-label="Copy CSV">
                <Copy className="h-4 w-4" /> <span className="hidden md:inline">Copy</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={handlePaste} aria-label="Paste CSV">
                <ClipboardPaste className="h-4 w-4" /> <span className="hidden md:inline">Paste</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
                aria-label="Import from Excel"
              >
                <Upload className="h-4 w-4" /> <span className="hidden md:inline">Import</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExport} aria-label="Export to Excel">
                <Download className="h-4 w-4" /> <span className="hidden md:inline">Export</span>
              </Button>
              <Button size="sm" onClick={openAdd} className="grow sm:grow-0">
                <Plus className="h-4 w-4" /> Add part
              </Button>
            </>
          )
        }
      />

      {/* Summary + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Badge variant="outline">{rows.length} rows</Badge>
          {lowCount > 0 && (
            <Badge variant="danger">
              <AlertTriangle className="h-3 w-3" /> {lowCount} low stock
            </Badge>
          )}
        </div>
        <div className="w-full sm:w-72">
          <Input
            icon={Search}
            placeholder="Search part, machine…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {canWrite && selected.size > 0 && (
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
        <TableSkeleton rows={8} cols={7} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={query ? "No matching parts" : "No spare parts yet"}
          description={
            query
              ? "Try a different search term."
              : canWrite
              ? "Add your first spare part to get started."
              : "Parts will appear here once added."
          }
          action={
            canWrite && !query ? (
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4" /> Add part
              </Button>
            ) : null
          }
        />
      ) : (
        <Table minWidth="900px">
          <THead>
            {canWrite && (
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
            <TH>Part</TH>
            <TH>Machine</TH>
            <TH>Sub-machine</TH>
            <TH className="text-right">Stock</TH>
            <TH>Unit</TH>
            <TH className="text-right">Reorder</TH>
            <TH>Last Added</TH>
            <TH>Last Transaction</TH>
            {canWrite && <TH className="w-10" />}
          </THead>
          <TBody>
            {filtered.map((row) => {
              const low = isLowStock(row);
              return (
                <TR
                  key={row.usageId}
                  className={low ? "bg-danger-soft hover:bg-danger-soft" : ""}
                >
                  {canWrite && (
                    <TD>
                      <input
                        type="checkbox"
                        checked={selected.has(row.usageId)}
                        onChange={() => toggleRow(row.usageId)}
                        className="h-4 w-4 cursor-pointer accent-ink-900"
                        aria-label={`Select ${row.name}`}
                      />
                    </TD>
                  )}
                  <TD>
                    <div className="flex items-center gap-3">
                      {row.image_url ? (
                        <img
                          src={row.image_url}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
                          <Package className="h-4 w-4" />
                        </span>
                      )}
                      <span className="font-semibold text-ink-900">
                        {row.name}
                      </span>
                    </div>
                  </TD>
                  <TD className="text-ink-600">{row.machine}</TD>
                  <TD className="text-ink-600">{row.subMachine}</TD>
                  <TD className="text-right">
                    <span
                      className={
                        low
                          ? "font-bold text-danger"
                          : "font-semibold tabular-nums text-ink-900"
                      }
                    >
                      {row.quantity}
                    </span>
                  </TD>
                  <TD className="text-ink-500">{row.unit}</TD>
                  <TD className="text-right tabular-nums text-ink-500">
  {row.reorder_level}
</TD>

<TD className="whitespace-nowrap text-ink-500">
  {formatDate(row.last_added_date)}
</TD>

<TD className="whitespace-nowrap text-ink-500">
  {formatDate(row.last_issue_date)}
</TD>
                  {canWrite && (
                    <TD>
                      <button
                        onClick={() => openEdit(row)}
                        className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                        aria-label={`Edit ${row.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </TD>
                  )}
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}

      {canWrite && (
        <PartFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          inventory={rows}
          editRow={editRow}
        />
      )}
    </div>
  );
}
