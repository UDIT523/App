import { supabase } from "../lib/supabase";

/**
 * Lightweight user store backed by the public.users table (no Supabase Auth).
 * NOTE: passwords are stored/compared as plain text — trusted internal use only.
 */

export async function registerUser({ username, password, fullName }) {
  const uname = username.trim().toLowerCase();

  const { data, error } = await supabase
    .from("users")
    .insert({
      username: uname,
      password,
      full_name: fullName?.trim() || uname,
      role: "technician",
      status: "pending",
    })
    .select("id, username, full_name, role, status, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("That username is already taken");
    }
    throw error;
  }

  return data;
}

export async function loginUser(username, password) {
  const uname = username.trim().toLowerCase();

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, username, full_name, role, status, password, created_at"
    )
    .eq("username", uname)
    .maybeSingle();

  if (error) throw error;

  if (!data || data.password !== password) {
    throw new Error("Invalid username or password");
  }

  if (data.status !== "approved") {
    throw new Error(
      "Your account is awaiting administrator approval."
    );
  }

  const { password: _pw, ...user } = data;
  return user;
}

export async function listUsers() {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, username, full_name, role, status, created_at"
    )
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function updateUserRole(userId, role) {
  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) throw error;
}

export async function approveUser(userId) {
  const { error } = await supabase
    .from("users")
    .update({ status: "approved" })
    .eq("id", userId);

  if (error) throw error;
}

export async function rejectUser(userId) {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);

  if (error) throw error;
}

export async function deleteUser(userId) {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);

  if (error) throw error;
}