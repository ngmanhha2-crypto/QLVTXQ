import { InventoryItem, UsageRecord, ImportRecord } from "../types";

const API_URL = "https://script.google.com/macros/s/XXXXXXXXXXXX/exec"; 
//  ^^^^^^^^^ dán đúng URL Web App Apps Script của bạn vào đây (đuôi /exec)

export interface AllDataFromSheet {
  inventory: InventoryItem[];
  usageHistory: UsageRecord[];
  importHistory: ImportRecord[];
}

export async function loadAllFromSheet(): Promise<AllDataFromSheet> {
  try {
    const res = await fetch(`${API_URL}?action=getAll`);
    const text = await res.text();

    if (!res.ok) {
      console.error("Lỗi HTTP khi load ALL từ Sheets:", res.status, text);
      return { inventory: [], usageHistory: [], importHistory: [] };
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Lỗi parse JSON từ Apps Script:", err, text);
      return { inventory: [], usageHistory: [], importHistory: [] };
    }

    return {
      inventory: (data.inventory || []) as InventoryItem[],
      usageHistory: (data.usageHistory || []) as UsageRecord[],
      importHistory: (data.importHistory || []) as ImportRecord[],
    };
  } catch (err) {
    console.error("Lỗi fetch tới Apps Script:", err);
    return { inventory: [], usageHistory: [], importHistory: [] };
  }
}

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

  const text = await res.text();

  if (!res.ok) {
    console.error("Lỗi khi save ALL lên Sheets:", res.status, text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  console.log("Đã lưu ALL data lên Sheets:", text);
}
