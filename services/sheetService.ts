import { InventoryItem } from "../types";

const API_URL = "PASTE_YOUR_WEB_APP_URL_HERE"; // <-- dán URL Web App

export async function loadInventoryFromSheet(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_URL}?action=getInventory`);
  if (!res.ok) {
    console.error("Lỗi load inventory:", await res.text());
    throw new Error("Cannot load inventory from Google Sheets");
  }
  const data = await res.json();
  return (data.items || []) as InventoryItem[];
}

export async function saveInventoryToSheet(inventory: InventoryItem[]): Promise<void> {
  const res = await fetch(`${API_URL}?action=saveInventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inventory }),
  });
  if (!res.ok) {
    console.error("Lỗi save inventory:", await res.text());
    throw new Error("Cannot save inventory to Google Sheets");
  }
  const data = await res.json();
  console.log("Đã lưu inventory:", data);
}
