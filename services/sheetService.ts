const STATE_SHEET = "STATE";
const STATE_CELL = "A1";

export async function loadAllFromSheet() {
  return new Promise<any>((resolve, reject) => {
    google.script.run
      .withSuccessHandler((data: any) => {
        if (!data || typeof data !== "object") return resolve({});
        resolve(data);
      })
      .withFailureHandler((err: any) => {
        console.error("Lỗi loadAllFromSheet:", err);
        resolve({}); // Không reject → app vẫn chạy
      })
      .getState();
  });
}

export async function saveAllToSheet(
  inventory: any[],
  usageHistory: any[],
  importHistory: any[]
) {
  const payload = {
    inventory,
    usageHistory,
    importHistory
  };

  return new Promise<void>((resolve, reject) => {
    google.script.run
      .withSuccessHandler(() => resolve())
      .withFailureHandler((err: any) => {
        console.error("Lỗi ghi Sheets:", err);
        reject(err);
      })
      .saveState(payload);
  });
}
