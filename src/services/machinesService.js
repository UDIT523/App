import { supabase } from "../lib/supabase";

/** Find a machine by name (case-insensitive) or create it; returns its id. */
export async function getOrCreateMachine(name) {
  const trimmed = name.trim();
  const { data: existing } = await supabase
    .from("machines")
    .select("id")
    .ilike("name", trimmed)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("machines")
    .insert({ name: trimmed })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Find a sub-machine within a machine or create it; returns its id. */
export async function getOrCreateSubMachine(machineId, name) {
  const trimmed = name.trim();
  const { data: existing } = await supabase
    .from("sub_machines")
    .select("id")
    .eq("machine_id", machineId)
    .ilike("name", trimmed)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("sub_machines")
    .insert({ machine_id: machineId, name: trimmed })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
