import { supabase } from "../lib/supabase";

export async function listTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Issue a part atomically via the server-side RPC (race-free stock check). */
export async function issuePart({
  partId,
  machine,
  subMachine,
  givenTo,
  quantity,
  issueDate,
  issueMode,
  invoiceUrl,
  issuedBy,
}) {
  const { data, error } = await supabase.rpc("issue_part", {
    p_part_id: partId,
    p_machine: machine,
    p_sub_machine: subMachine,
    p_given_to: givenTo,
    p_quantity: Number(quantity),
    p_issue_date: issueDate,
    p_issue_mode: issueMode || "machine",
    p_invoice_url: invoiceUrl || null,
    p_issued_by: issuedBy || null,
  });
  if (error) throw error;
  return data;
}

export async function deleteTransactions(ids) {
  const { error } = await supabase.from("transactions").delete().in("id", ids);
  if (error) throw error;
}
