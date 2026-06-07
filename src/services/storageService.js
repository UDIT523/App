import { supabase } from "../lib/supabase";

/**
 * Upload a file to a Supabase Storage bucket and return its URL.
 * - part-images is public → returns a public URL.
 * - invoices is private → returns a long-lived signed URL.
 */
async function uploadTo(bucket, file, { signed = false } = {}) {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;

  if (signed) {
    const { data, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
    if (signErr) throw signErr;
    return data.signedUrl;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function uploadPartImage(file) {
  return uploadTo("part-images", file);
}

export function uploadInvoice(file) {
  return uploadTo("invoices", file, { signed: true });
}
