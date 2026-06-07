import { useMemo, useRef, useState } from "react";
import { PackageMinus, Boxes, Wrench, Info } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import Card, { CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Combobox from "../components/ui/Combobox";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";
import { useInventory } from "../hooks/useParts";
import { useTransactionMutations } from "../hooks/useTransactions";
import { useAuth } from "../context/AuthContext";
import { todayISO, isLowStock } from "../utils/format";
import { cn } from "../utils/cn";

const uniq = (arr) => [...new Set(arr.filter(Boolean))];

export default function IssuePart() {
  const { data: rows = [], isLoading } = useInventory();
  const { issue } = useTransactionMutations();
  const { user } = useAuth();
  const toast = useToast();

  const machineRef = useRef(null);
  const subMachineRef = useRef(null);
  const partRef = useRef(null);

  const [mode, setMode] = useState("machine");
  const [machine, setMachine] = useState("");
  const [subMachine, setSubMachine] = useState("");
  const [partName, setPartName] = useState("");
  const [givenTo, setGivenTo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [issueDate, setIssueDate] = useState(todayISO());
  const [errors, setErrors] = useState({});

  const machineOptions = useMemo(() => {
    if (mode === "spare" && partName) {
      return uniq(rows.filter((r) => r.name === partName).map((r) => r.machine));
    }
    return uniq(rows.map((r) => r.machine));
  }, [rows, mode, partName]);

  const subMachineOptions = useMemo(() => {
    if (!machine) return [];
    return uniq(
      rows
        .filter(
          (r) =>
            r.machine === machine &&
            (mode === "machine" || !partName || r.name === partName)
        )
        .map((r) => r.subMachine)
    );
  }, [rows, machine, mode, partName]);

  const partOptions = useMemo(() => {
    if (mode === "spare") return uniq(rows.map((r) => r.name));
    if (!machine || !subMachine) return [];
    return uniq(
      rows
        .filter((r) => r.machine === machine && r.subMachine === subMachine)
        .map((r) => r.name)
    );
  }, [rows, mode, machine, subMachine]);

  const selectedRow = useMemo(
    () =>
      rows.find(
        (r) =>
          r.name === partName &&
          r.machine === machine &&
          r.subMachine === subMachine
      ),
    [rows, partName, machine, subMachine]
  );

  const available = selectedRow ? selectedRow.quantity : null;

  const reset = () => {
    setMachine("");
    setSubMachine("");
    setPartName("");
    setGivenTo("");
    setQuantity("");
    setIssueDate(todayISO());
    setErrors({});
  };

  const switchMode = (m) => {
    setMode(m);
    reset();
  };

  const validate = () => {
    const next = {};
    if (!partName.trim()) next.partName = "Required";
    if (!machine.trim()) next.machine = "Required";
    if (!subMachine.trim()) next.subMachine = "Required";
    if (!givenTo.trim()) next.givenTo = "Required";
    const q = Number(quantity);
    if (!quantity || q <= 0) next.quantity = "Must be greater than 0";
    else if (available != null && q > available)
      next.quantity = `Only ${available} in stock`;
    if (!selectedRow) next.partName = "Select a valid part for this machine";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      await issue.mutateAsync({
        partId: selectedRow.partId,
        machine,
        subMachine,
        givenTo,
        quantity,
        issueDate,
        issueMode: mode,
        issuedBy: user?.full_name || user?.username || null,
      });

      const remaining = available - Number(quantity);
      toast.success("Part issued", `${quantity} × ${partName} → ${givenTo}`);
      if (remaining <= selectedRow.reorder_level) {
        toast.warning(
          "Reorder alert",
          `${partName} is at ${remaining} (reorder level ${selectedRow.reorder_level})`
        );
      }
      reset();
    } catch (e) {
      toast.error("Could not issue part", e.message);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Issue Part" />
        <Spinner label="Loading inventory…" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div>
        <PageHeader title="Issue Part" />
        <EmptyState
          icon={PackageMinus}
          title="No parts to issue"
          description="Add spare parts to your inventory first."
        />
      </div>
    );
  }

  const partField = (
    <Combobox
      ref={partRef}
      label="Spare part"
      required
      value={partName}
      onChange={(v) => {
        setPartName(v);
        if (mode === "spare") {
          setMachine("");
          setSubMachine("");
        }
      }}
      onSelect={() => {
        if (mode === "spare") {
          setTimeout(() => machineRef.current?.openDropdown?.(), 0);
        }
      }}
      options={partOptions}
      placeholder="Search spare part"
      disabled={mode === "machine" && (!machine || !subMachine)}
      error={errors.partName}
    />
  );

  const machineField = (
    <Combobox
      ref={machineRef}
      label="Machine"
      required
      value={machine}
      onChange={(v) => {
        setMachine(v);
        setSubMachine("");
        if (mode === "machine") setPartName("");
      }}
      onSelect={() => {
        setTimeout(() => subMachineRef.current?.openDropdown?.(), 0);
      }}
      options={machineOptions}
      placeholder="Search machine"
      disabled={mode === "spare" && !partName}
      error={errors.machine}
    />
  );

  const subField = (
    <Combobox
      ref={subMachineRef}
      label="Sub-machine"
      required
      value={subMachine}
      onChange={(v) => {
        setSubMachine(v);
        if (mode === "machine") setPartName("");
      }}
      onSelect={() => {
        if (mode === "machine") {
          setTimeout(() => partRef.current?.openDropdown?.(), 0);
        }
      }}
      options={subMachineOptions}
      placeholder="Search sub-machine"
      disabled={!machine}
      error={errors.subMachine}
    />
  );

  return (
    <div>
      <PageHeader
        title="Issue Part"
        description="Deduct stock and log a transaction in one step."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="mb-6 inline-flex rounded-xl border border-ink-200 bg-ink-50 p-1">
              {[
                { key: "machine", label: "By machine", icon: Wrench },
                { key: "spare", label: "By spare part", icon: Boxes },
              ].map((m) => {
                const Icon = m.icon;
                const active = mode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => switchMode(m.key)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                      active ? "bg-white text-ink-900 " : "text-ink-500 hover:text-ink-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {mode === "machine" ? (
                <>
                  {machineField}
                  {subField}
                  <div className="sm:col-span-2">{partField}</div>
                </>
              ) : (
                <>
                  <div className="sm:col-span-2">{partField}</div>
                  {machineField}
                  {subField}
                </>
              )}

              <Input
                label="Given to"
                required
                value={givenTo}
                onChange={(e) => setGivenTo(e.target.value)}
                placeholder="Recipient name"
                error={errors.givenTo}
              />
              <Input
                label="Quantity"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={errors.quantity}
                hint={available != null ? `${available} in stock` : undefined}
              />
              <Input
                label="Issue date"
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={reset}>
                Clear
              </Button>
              <Button onClick={submit} loading={issue.isPending}>
                <PackageMinus className="h-4 w-4" /> Issue part
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardBody>
            <h3 className="text-sm font-semibold text-ink-900">Selected part</h3>
            {selectedRow ? (
              <div className="mt-4 space-y-4 animate-fade-in">
                {selectedRow.image_url ? (
                  <img
                    src={selectedRow.image_url}
                    alt=""
                    className="h-32 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded-xl bg-ink-50 text-ink-300">
                    <Boxes className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <p className="text-base font-bold text-ink-900">{selectedRow.name}</p>
                  <p className="text-sm text-ink-500">
                    {selectedRow.machine} · {selectedRow.subMachine}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
                  <span className="text-sm text-ink-500">In stock</span>
                  <span className="flex items-center gap-2">
                    <span className="text-lg font-bold tabular-nums text-ink-900">
                      {selectedRow.quantity} {selectedRow.unit}
                    </span>
                    {isLowStock(selectedRow) && <Badge variant="danger">Low</Badge>}
                  </span>
                </div>
                <p className="text-xs text-ink-400">
                  Reorder level: {selectedRow.reorder_level}
                </p>
                <p className="text-xs text-ink-400">
                  Last issue date: {selectedRow.last_issue_date || "N/A"}
                </p>
              </div>
            ) : (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-ink-50 p-4 text-sm text-ink-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                Pick a part, machine and sub-machine to see stock details here.
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}