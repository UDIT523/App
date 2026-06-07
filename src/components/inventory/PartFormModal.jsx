import { useEffect, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Combobox from "../ui/Combobox";
import { useToast } from "../ui/Toast";
import { usePartMutations } from "../../hooks/useParts";

const uniq = (arr) => [...new Set(arr.filter(Boolean))];

export default function PartFormModal({ open, onClose, inventory, editRow }) {
  const isEdit = Boolean(editRow);
  const toast = useToast();
  const { add, edit } = usePartMutations();

  const [machine, setMachine] = useState("");
  const [subMachine, setSubMachine] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Suggestion lists derived from existing inventory.
  const machineOptions = useMemo(
    () => uniq(inventory.map((r) => r.machine)),
    [inventory]
  );
  const subMachineOptions = useMemo(
    () =>
      uniq(
        inventory.filter((r) => r.machine === machine).map((r) => r.subMachine)
      ),
    [inventory, machine]
  );
  const nameOptions = useMemo(
    () => uniq(inventory.map((r) => r.name)),
    [inventory]
  );

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setImageFile(null);
    if (editRow) {
      setMachine(editRow.machine);
      setSubMachine(editRow.subMachine);
      setName(editRow.name);
      setQuantity(String(editRow.quantity));
      setUnit(editRow.unit || "");
      setReorderLevel(String(editRow.reorder_level));
      setPreview(editRow.image_url || null);
    } else {
      setMachine("");
      setSubMachine("");
      setName("");
      setQuantity("");
      setUnit("");
      setReorderLevel("");
      setPreview(null);
    }
  }, [open, editRow]);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Required";
    if (!isEdit && !machine.trim()) next.machine = "Required";
    if (!isEdit && !subMachine.trim()) next.subMachine = "Required";
    if (quantity === "" || Number(quantity) < 0) next.quantity = "Enter a valid quantity";
    if (!isEdit && (reorderLevel === "" || Number(reorderLevel) < 0))
      next.reorderLevel = "Enter a valid level";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      if (isEdit) {
        await edit.mutateAsync({
          partId: editRow.partId,
          quantity,
          reorderLevel,
          unit,
          imageFile,
        });
        toast.success("Part updated", name);
      } else {
        const res = await add.mutateAsync({
          machine,
          subMachine,
          name,
          quantity,
          unit,
          reorderLevel,
          imageFile,
        });
        toast.success(
          res.merged ? "Stock updated" : "Part added",
          res.merged
            ? `${name} stock increased (shared across machines)`
            : `${name} added to ${machine} / ${subMachine}`
        );
      }
      onClose();
    } catch (e) {
      toast.error("Could not save", e.message);
    }
  };

  const saving = add.isPending || edit.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit spare part" : "Add spare part"}
      description={
        isEdit
          ? "Stock and reorder level are shared across all machines using this part."
          : "Same part name shares one global stock & reorder level across machines."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            {isEdit ? "Save changes" : "Add part"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Combobox
          label="Machine"
          required
          value={machine}
          onChange={(v) => {
            setMachine(v);
            setSubMachine("");
          }}
          options={machineOptions}
          placeholder="e.g. CNC Lathe"
          disabled={isEdit}
          error={errors.machine}
        />
        <Combobox
          label="Sub-machine"
          required
          value={subMachine}
          onChange={setSubMachine}
          options={subMachineOptions}
          placeholder="e.g. Spindle Unit"
          disabled={isEdit || !machine}
          error={errors.subMachine}
        />
        <div className="sm:col-span-2">
          <Combobox
            label="Spare part name"
            required
            value={name}
            onChange={setName}
            options={nameOptions}
            placeholder="e.g. Bearing 6204"
            disabled={isEdit}
            error={errors.name}
            hint={!isEdit ? "Existing names merge into shared stock." : undefined}
          />
        </div>
        <Input
          label={isEdit ? "Current stock" : "Quantity to add"}
          type="number"
          min="0"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={errors.quantity}
        />
        <Input
          label="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Nos, pcs, set…"
        />
        <Input
          label="Reorder level"
          type="number"
          min="0"
          required={!isEdit}
          value={reorderLevel}
          onChange={(e) => setReorderLevel(e.target.value)}
          error={errors.reorderLevel}
          hint={isEdit ? "Shared across all machines." : "Used for new parts only."}
        />

        {/* Image upload */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Image</span>
          <div className="flex items-center gap-3">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setImageFile(null);
                    }}
                    className="absolute right-0.5 top-0.5 rounded-md bg-ink-950/70 p-0.5 text-white"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <ImagePlus className="h-5 w-5 text-ink-400" />
              )}
            </div>
            <label className="cursor-pointer rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50">
              {preview ? "Change" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickImage}
              />
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
