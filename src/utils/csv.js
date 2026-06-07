const INV_COLS = [
  "Machine Name",
  "Sub-Machine Name",
  "Spare Part Name",
  "Current Stock Quantity",
  "Unit",
  "Reorder Level",
  "Date Of Last Issue",
];

export function inventoryToCSV(rows) {
  const lines = rows.map((r) =>
    [
      r.machine,
      r.subMachine,
      r.name,
      r.quantity,
      r.unit,
      r.reorder_level,
      r.last_issue_date || "",
    ].join(",")
  );
  return [INV_COLS.join(","), ...lines].join("\n");
}

/** Parse clipboard CSV text into normalized inventory rows. */
export function parseInventoryCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) throw new Error("Invalid CSV data");
  const headers = lines[0].split(",").map((h) => h.trim());
  const idx = (name) => headers.indexOf(name);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const v = lines[i].split(",");
    rows.push({
      machine: v[idx("Machine Name")] || "",
      subMachine: v[idx("Sub-Machine Name")] || "",
      name: v[idx("Spare Part Name")] || "",
      quantity: Number(v[idx("Current Stock Quantity")]) || 0,
      unit: v[idx("Unit")] || "Nos",
      reorderLevel: Number(v[idx("Reorder Level")]) || 0,
    });
  }
  return rows;
}

export function transactionsToCSV(rows) {
  const cols = [
    "Spare Part",
    "Machine",
    "Sub Machine",
    "Given To",
    "Quantity",
    "Issue Date",
  ];
  const lines = rows.map((t) =>
    [t.part_name, t.machine, t.sub_machine, t.given_to, t.quantity, t.issue_date].join(
      ","
    )
  );
  return [cols.join(","), ...lines].join("\n");
}
