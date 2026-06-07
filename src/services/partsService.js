import { supabase } from "../lib/supabase";
import { getOrCreateMachine, getOrCreateSubMachine } from "./machinesService";
import { uploadPartImage } from "./storageService";

/**
 * Inventory list = one row per part-usage (a part as used in a sub-machine),
 * each carrying the part's GLOBAL stock/reorder (shared across machines).
 * Sorted by machine → sub-machine → part name, matching the original UX.
 */
export async function listInventory() {
  const { data, error } = await supabase
    .from("part_usages")
    .select(
      `id,
       part:parts(id, name, unit, quantity, reorder_level, image_url, last_issue_date),
       sub_machine:sub_machines(id, name, machine:machines(id, name))`
    );
  if (error) throw error;

  const rows = (data || [])
    .filter((u) => u.part && u.sub_machine)
    .map((u) => ({
      usageId: u.id,
      partId: u.part.id,
      name: u.part.name,
      unit: u.part.unit,
      quantity: u.part.quantity,
      reorder_level: u.part.reorder_level,
      image_url: u.part.image_url,
      last_issue_date: u.part.last_issue_date,
      machine: u.sub_machine.machine?.name || "",
      subMachine: u.sub_machine.name,
      subMachineId: u.sub_machine.id,
    }));

  return rows.sort(
    (a, b) =>
      a.machine.localeCompare(b.machine) ||
      a.subMachine.localeCompare(b.subMachine) ||
      a.name.localeCompare(b.name)
  );
}

/** Look up a part by exact (case-insensitive) name. */
async function findPartByName(name) {
  const { data } = await supabase
    .from("parts")
    .select("id, name, quantity, reorder_level, unit, image_url")
    .ilike("name", name.trim())
    .maybeSingle();
  return data || null;
}

/**
 * Add stock for a part at a machine/sub-machine.
 * Mirrors the original rule: same part name = ONE global quantity + reorder
 * level. Existing part → add to global stock, keep its reorder level; new part
 * → create it. Either way, link it to the given sub-machine (part_usage).
 */
export async function addOrUpdatePart({
  machine,
  subMachine,
  name,
  quantity,
  unit,
  reorderLevel,
  imageFile,
}) {
  const qty = Number(quantity) || 0;
  const today = new Date().toISOString().split("T")[0];

  let imageUrl;
  if (imageFile) imageUrl = await uploadPartImage(imageFile);

  const existing = await findPartByName(name);
  let partId;

  if (existing) {
    const patch = {
      quantity: existing.quantity + qty,
      last_issue_date: today,
    };
    if (unit?.trim()) patch.unit = unit.trim();
    if (imageUrl) patch.image_url = imageUrl;
    const { data, error } = await supabase
      .from("parts")
      .update(patch)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    partId = data.id;
  } else {
    const { data, error } = await supabase
      .from("parts")
      .insert({
        name: name.trim(),
        unit: unit?.trim() || "Nos",
        quantity: qty,
        reorder_level: Number(reorderLevel) || 0,
        image_url: imageUrl || null,
        last_issue_date: today,
      })
      .select("id")
      .single();
    if (error) throw error;
    partId = data.id;
  }

  const machineId = await getOrCreateMachine(machine);
  const subMachineId = await getOrCreateSubMachine(machineId, subMachine);

  const { error: usageErr } = await supabase
    .from("part_usages")
    .upsert(
      { part_id: partId, sub_machine_id: subMachineId },
      { onConflict: "part_id,sub_machine_id", ignoreDuplicates: true }
    );
  if (usageErr) throw usageErr;

  return { partId, merged: Boolean(existing) };
}

/** Edit a part's global fields (quantity, reorder level, unit, image). */
export async function updatePart(partId, { quantity, reorderLevel, unit, imageFile }) {
  const patch = {};
  if (quantity !== undefined) patch.quantity = Number(quantity);
  if (reorderLevel !== undefined) patch.reorder_level = Number(reorderLevel);
  if (unit !== undefined) patch.unit = unit.trim() || "Nos";
  if (imageFile) patch.image_url = await uploadPartImage(imageFile);

  const { error } = await supabase.from("parts").update(patch).eq("id", partId);
  if (error) throw error;
}

/**
 * Delete selected inventory rows (part-usages). When a part has no remaining
 * usages, the part itself is removed — matching "delete every row of a part
 * removes the part" from the original.
 */
export async function deleteInventoryRows(rows) {
  const usageIds = rows.map((r) => r.usageId);
  const { error } = await supabase
    .from("part_usages")
    .delete()
    .in("id", usageIds);
  if (error) throw error;

  const partIds = [...new Set(rows.map((r) => r.partId))];
  for (const partId of partIds) {
    const { count } = await supabase
      .from("part_usages")
      .select("id", { count: "exact", head: true })
      .eq("part_id", partId);
    if ((count ?? 0) === 0) {
      await supabase.from("parts").delete().eq("id", partId);
    }
  }
}

/** Bulk import (from Excel/CSV) — applies the same add/merge logic per row. */
export async function importParts(rows) {
  let imported = 0;
  for (const row of rows) {
    if (!row.name?.trim()) continue;
    await addOrUpdatePart({
      machine: row.machine || "",
      subMachine: row.subMachine || "",
      name: row.name,
      quantity: row.quantity || 0,
      unit: row.unit || "Nos",
      reorderLevel: row.reorderLevel || 0,
    });
    imported += 1;
  }
  return imported;
}
