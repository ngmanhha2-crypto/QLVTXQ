import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { StockTake } from './components/StockTake';
import { Forecast } from './components/Forecast';
import { Report } from './components/Report';
import { UsageHistory } from './components/UsageHistory';
import { AIAssistant } from './components/AIAssistant';
import { InventoryItem, TabView, UsageRecord, ImportRecord } from './types';
import { LucideLayoutDashboard, LucidePackage, LucideBot, LucideHistory, LucideClipboardCheck, LucideCalendarRange, LucideFileChartColumn } from 'lucide-react';

// Mock data for initial load with new categories
const INITIAL_DATA: InventoryItem[] = [
  { id: '1', name: 'Phim X-quang 35x43 (Xanh)', category: 'Vật tư y tế', quantity: 150, unit: 'Tấm', minLevel: 200, location: 'Phòng chụp X quang', cost: 50000 },
  { id: '2', name: 'Phim X-quang 24x30 (Xanh)', category: 'Vật tư y tế', quantity: 320, unit: 'Tấm', minLevel: 100, location: 'Phòng chụp X quang', cost: 40000 },
  { id: '3', name: 'Thuốc cản quang Omnipaque 300mg', category: 'Thuốc', quantity: 45, unit: 'Lọ', minLevel: 50, location: 'Phòng chụp Cắt lớp vi tính', cost: 850000 },
  { id: '4', name: 'Giấy in A4 Double A', category: 'Văn phòng phẩm', quantity: 10, unit: 'Ram', minLevel: 5, location: 'Tất cả', cost: 80000 },
  { id: '5', name: 'Bơm tiêm áp lực cao (CT)', category: 'Vật tư y tế', quantity: 80, unit: 'Cái', minLevel: 100, location: 'Phòng chụp Cắt lớp vi tính', cost: 150000 },
  { id: '6', name: 'Găng tay y tế vô khuẩn', category: 'Vật tư y tế', quantity: 500, unit: 'Đôi', minLevel: 200, location: 'Tất cả', cost: 3500 },
  { id: '7', name: 'Bút bi Thiên Long', category: 'Văn phòng phẩm', quantity: 50, unit: 'Cái', minLevel: 20, location: 'Tất cả', cost: 5000 },
  { id: '8', name: 'Gel siêu âm', category: 'Vật tư y tế', quantity: 5, unit: 'Can 5L', minLevel: 2, location: 'Phòng chụp X quang', cost: 120000 },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabView>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_DATA);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);

  // Function to update inventory item quantity
  const updateStock = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        
        // Log import if delta > 0
        if (delta > 0) {
            const importRecord: ImportRecord = {
                id: `imp-${Date.now()}`,
                itemId: item.id,
                itemName: item.name,
                quantity: delta,
                date: new Date().toISOString().split('T')[0],
                costPerUnit: item.cost,
                totalCost: item.cost * delta
            };
            setImportHistory(prevH => [...prevH, importRecord]);
        }
        
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const addItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
    // Log initial import
    if (item.quantity > 0) {
        const importRecord: ImportRecord = {
            id: `imp-init-${Date.now()}`,
            itemId: item.id,
            itemName: item.name,
            quantity: item.quantity,
            date: new Date().toISOString().split('T')[0],
            costPerUnit: item.cost,
            totalCost: item.cost * item.quantity
        };
        setImportHistory(prev => [...prev, importRecord]);
    }
  };

  const editItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  // Record usage: decrease stock and log history
  const recordUsage = (itemId: string, quantity: number, date: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    if (item.quantity < quantity) {
      alert(`Không đủ hàng tồn kho! Hiện chỉ còn ${item.quantity} ${item.unit}.`);
      return;
    }

    // Update inventory
    setInventory(prev => prev.map(i => {
      if (i.id === itemId) {
        return { ...i, quantity: i.quantity - quantity };
      }
      return i;
    }));

    // Add log
    const newRecord: UsageRecord = {
      id: Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      quantity: quantity,
      date: date,
      costPerUnit: item.cost,
      totalCost: item.cost * quantity
    };

    setUsageHistory(prev => [newRecord, ...prev]);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard inventory={inventory} />;
      case 'inventory':
        return (
          <InventoryList 
            inventory={inventory} 
            onUpdateStock={updateStock} 
            onAddItem={addItem}
            onEditItem={editItem}
            onDeleteItem={deleteItem}
            onRecordUsage={recordUsage}
          />
        );
      case 'stock-take':
        return (
            <StockTake 
                inventory={inventory}
                onRecordUsage={recordUsage}
            />
        );
      case 'forecast':
        return (
            <Forecast
                inventory={inventory}
                usageHistory={usageHistory}
            />
        );
      case 'report':
        return (
            <Report 
                inventory={inventory}
                usageHistory={usageHistory}
                importHistory={importHistory}
            />
        );
      case 'usage':
        return <UsageHistory records={usageHistory} />;
      case 'ai-assistant':
        return <AIAssistant inventory={inventory} />;
      default:
        return <Dashboard inventory={inventory} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between shrink-0">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {currentTab === 'dashboard' && <><LucideLayoutDashboard className="w-5 h-5 text-medical-600"/> Tổng quan</>}
            {currentTab === 'inventory' && <><LucidePackage className="w-5 h-5 text-medical-600"/> Kho vật tư</>}
            {currentTab === 'stock-take' && <><LucideClipboardCheck className="w-5 h-5 text-medical-600"/> Kiểm kê kho</>}
            {currentTab === 'forecast' && <><LucideCalendarRange className="w-5 h-5 text-medical-600"/> Tạo dự trù</>}
            {currentTab === 'report' && <><LucideFileChartColumn className="w-5 h-5 text-medical-600"/> Báo cáo</>}
            {currentTab === 'usage' && <><LucideHistory className="w-5 h-5 text-medical-600"/> Lịch sử & Chi phí</>}
            {currentTab === 'ai-assistant' && <><LucideBot className="w-5 h-5 text-medical-600"/> Trợ lý AI</>}
          </h1>
          <div className="flex items-center gap-4">
             <div className="text-sm text-gray-500">
                Khoa Chẩn Đoán Hình Ảnh
             </div>
             <div className="h-8 w-8 rounded-full bg-medical-100 flex items-center justify-center text-medical-600 font-bold border border-medical-200">
               AD
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}