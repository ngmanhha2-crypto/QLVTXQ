// services/sheetService.ts
import { InventoryItem, UsageRecord, ImportRecord } from "../types";

const API_URL = "https://script.google.com/macros/s/AKfycbwMA5ydItXS9IjsH2byAN15JuvmWiEbCxAlWQ6rPQfQ-FV_llT1WZ21yemEWbVStSdL/exec"; // <-- dán URL Web App Apps Script

export interface AllDataFromSheet {
  inventory: InventoryItem[];
  usageHistory: UsageRecord[];
  importHistory: ImportRecord[];
}

export async function loadAllFromSheet(): Promise<AllDataFromSheet> {
  try {
    const res = await fetch(`${API_URL}?action=getAll`);
    const text = await res.text(); // đọc text trước để dễ debug

    if (!res.ok) {
      console.error("Lỗi HTTP từ Apps Script:", res.status, text);
      // Trả về rỗng nhưng KHÔNG throw -> app vẫn chạy với INITIAL_DATA
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
    console.error("Lỗi save ALL lên Apps Script:", res.status, text);
    throw new Error("Cannot save data to Google Sheets");
  }

  console.log("Đã lưu ALL data:", text);
}
