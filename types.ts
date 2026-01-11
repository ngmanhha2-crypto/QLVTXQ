
export type TabView = 'dashboard' | 'inventory' | 'stock-take' | 'forecast' | 'report' | 'usage' | 'ai-assistant';

export type InventoryCategory = 'Vật tư y tế' | 'Văn phòng phẩm' | 'Thuốc';
export type InventoryLocation = 'Phòng chụp X quang' | 'Phòng chụp Cắt lớp vi tính' | 'Tất cả';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minLevel: number;
  location: string; // Keep as string to allow flexibility, but suggest specific values
  cost: number; // Cost per unit in VND
}

export interface UsageRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  date: string; // ISO date string
  costPerUnit: number;
  totalCost: number;
}

export interface ImportRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  date: string; // ISO date string
  costPerUnit: number;
  totalCost: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  min: number;
}
