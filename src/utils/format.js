/** Formatting helpers used across pages. */

export function formatDate(value) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function formatNumber(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "0";
  return n.toLocaleString();
}

/** A part is low on stock when quantity is at or below its reorder level. */
export function isLowStock(part) {
  if (!part) return false;
  return Number(part.quantity) <= Number(part.reorder_level);
}

export function roleLabel(role) {
  switch (role) {
    case "admin":
      return "Administrator";
    case "manager":
      return "Manager";
    case "technician":
      return "Technician";
    default:
      return role || "—";
  }
}

export function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}
