import { InventoryItem, UsageRecord, ImportRecord } from "../types";

const API_URL = "https://script.google.com/macros/s/AKfycbxBwdL1_ix53G8K8xvkQF9H4xaEToLmEIQLqEezRqJ7h4Bx9jwhVmAyLCB8peWbG4Jt/exec"; // URL Web App Apps Script

export interface AllDataFromSheet {
  inventory: InventoryItem[];
  usageHistory: UsageRecord[];
  importHistory: ImportRecord[];
}

// Lấy cả 3 từ Google Sheets
export async function loadAllFromSheet(): Promise<AllDataFromSheet> {
  const res = await fetch(`${API_URL}?action=getAll`);
  if (!res.ok) {
    console.error("Lỗi load ALL từ Sheets:", await res.text());
    throw new Error("Cannot load data from Google Sheets");
  }
  const data = await res.json();
  return {
    inventory: (data.inventory || []) as InventoryItem[],
    usageHistory: (data.usageHistory || []) as UsageRecord[],
    importHistory: (data.importHistory || []) as ImportRecord[],
  };
}

// Lưu cả 3 lên Google Sheets
export async function saveAllToSheet(
  inventory: InventoryItem[],
  usageHistory: UsageRecord[],
  importHistory: ImportRecord[]
): Promise<void> {
  const res = await fetch(`${API_URL}?action=saveAll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inventory, usageHistory, importHistory }),
  });

  if (!res.ok) {
    console.error("Lỗi save ALL:", await res.text());
    throw new Error("Cannot save data to Google Sheets");
  }
  const data = await res.json();
  console.log("Đã lưu ALL data:", data);
}
