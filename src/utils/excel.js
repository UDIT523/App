import * as XLSX from "xlsx";

const INV_HEADERS = {
  machine: "Machine Name",
  subMachine: "Sub-Machine Name",
  name: "Spare Part Name",
  quantity: "Current Stock Quantity",
  unit: "Unit",
  reorderLevel: "Reorder Level",
  lastIssue: "Date Of Last Issue",
};

/** Export inventory rows to an .xlsx download. */
export function exportInventory(rows) {
  const data = rows.map((r) => ({
    [INV_HEADERS.machine]: r.machine,
    [INV_HEADERS.subMachine]: r.subMachine,
    [INV_HEADERS.name]: r.name,
    [INV_HEADERS.quantity]: r.quantity,
    [INV_HEADERS.unit]: r.unit,
    [INV_HEADERS.reorderLevel]: r.reorder_level,
    [INV_HEADERS.lastIssue]: r.last_issue_date || "",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Spare Parts");
  XLSX.writeFile(wb, "Spare_Parts_Inventory.xlsx");
}

/** Parse an uploaded inventory .xlsx/.xls into normalized rows. */
export function parseInventoryFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () =>
      reject(new Error("Could not read file"));

    reader.onload = (e) => {
      try {
        const wb = XLSX.read(
          e.target.result,
          { type: "binary" }
        );

        const ws =
          wb.Sheets[wb.SheetNames[0]];

        const json =
          XLSX.utils.sheet_to_json(ws);

        const rows = json.map((row) => {
          const normalized = {};

          Object.keys(row).forEach((key) => {
            normalized[
              key
                .toLowerCase()
                .trim()
            ] = row[key];
          });

          return {
            machine:
              normalized[
                "machine name"
              ] ||
              normalized[
                "machine"
              ] ||
              "",

            subMachine:
              normalized[
                "sub-machine name"
              ] ||
              normalized[
                "sub machine name"
              ] ||
              normalized[
                "sub-machine"
              ] ||
              "",

            name:
              normalized[
                "spare part name"
              ] ||
              normalized[
                "part name"
              ] ||
              normalized[
                "spare part"
              ] ||
              "",

            quantity: Number(
              normalized[
                "current stock quantity"
              ] ??
                normalized[
                  "current stock"
                ] ??
                normalized[
                  "stock"
                ] ??
                normalized[
                  "quantity"
                ] ??
                0
            ),

            unit:
              normalized[
                "unit"
              ] || "Nos",

            reorderLevel: Number(
              normalized[
                "reorder level"
              ] ??
                normalized[
                  "reorder"
                ] ??
                normalized[
                  "minimum stock"
                ] ??
                0
            ),
          };
        });

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsBinaryString(file);
  });
}

/** Export transaction history to an .xlsx download. */
export function exportTransactions(rows) {
  const data = rows.map((t) => ({
    "Spare Part": t.part_name,
    Machine: t.machine,
    "Sub Machine": t.sub_machine,
    "Given To": t.given_to,
    Quantity: t.quantity,
    "Issue Date": t.issue_date,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.writeFile(wb, "Transaction_History.xlsx");
}

export function parseReceiveStockFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read file"));

    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);

        const rows = json.map((row) => ({
          name:
            row["Part Name"] ||
            row["Spare Part Name"] ||
            "",
          quantity: Number(row["Quantity"] ?? 0),
        }));

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsBinaryString(file);
  });
}