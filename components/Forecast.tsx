import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, UsageRecord } from '../types';
import { LucideCalendarRange, LucideCalculator, LucideTrendingUp, LucideDollarSign, LucideDownload } from 'lucide-react';

interface ForecastProps {
  inventory: InventoryItem[];
  usageHistory: UsageRecord[];
}

interface ForecastItem {
  id: string;
  name: string;
  unit: string;
  cost: number;
  currentStock: number; // Editable
  avgDailyUsage: number; // Editable
  suggestedOrder: number; // Calculated
  estimatedCost: number; // Calculated
}

export const Forecast: React.FC<ForecastProps> = ({ inventory, usageHistory }) => {
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [forecastItems, setForecastItems] = useState<ForecastItem[]>([]);

  // Initialize forecast data based on inventory and history
  useEffect(() => {
    const items: ForecastItem[] = inventory.map(item => {
      // Calculate average daily usage based on last 30 days of history
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const recentUsage = usageHistory
        .filter(r => r.itemId === item.id && new Date(r.date) >= thirtyDaysAgo)
        .reduce((sum, r) => sum + r.quantity, 0);
      
      const calculatedAvg = recentUsage > 0 ? parseFloat((recentUsage / 30).toFixed(2)) : 0;

      // Initial calculation
      const needed = calculatedAvg * forecastDays;
      const suggested = Math.max(0, Math.ceil(needed - item.quantity));

      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        cost: item.cost,
        currentStock: item.quantity,
        avgDailyUsage: calculatedAvg,
        suggestedOrder: suggested,
        estimatedCost: suggested * item.cost
      };
    });
    setForecastItems(items);
  }, [inventory, usageHistory]); // Re-run if inventory/history changes. Note: forecastDays dependency handled separately to preserve edits if possible, but for simplicity we re-calc on effect in this version or use separate handler.

  // Recalculate when Days change or User edits specific row values
  const handleDaysChange = (days: number) => {
    setForecastDays(days);
    setForecastItems(prev => prev.map(item => {
      const needed = item.avgDailyUsage * days;
      const suggested = Math.max(0, Math.ceil(needed - item.currentStock));
      return {
        ...item,
        suggestedOrder: suggested,
        estimatedCost: suggested * item.cost
      };
    }));
  };

  const handleItemChange = (id: string, field: 'currentStock' | 'avgDailyUsage', value: number) => {
    setForecastItems(prev => prev.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        // Recalculate dependent values
        const needed = newItem.avgDailyUsage * forecastDays;
        const suggested = Math.max(0, Math.ceil(needed - newItem.currentStock));
        return {
          ...newItem,
          suggestedOrder: suggested,
          estimatedCost: suggested * newItem.cost
        };
      }
      return item;
    }));
  };

  const totalEstimatedCost = useMemo(() => {
    return forecastItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  }, [forecastItems]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleExportExcel = () => {
    // Define headers
    const headers = [
        "Mã VT", 
        "Tên vật tư", 
        "Đơn vị", 
        "Đơn giá", 
        "Tồn hiện tại", 
        "TB Tiêu thụ/Ngày", 
        "Gợi ý nhập", 
        "Thành tiền dự kiến"
    ];

    // Map data to rows
    const rows = forecastItems.map(item => [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`, // Handle commas/quotes in name
        `"${item.unit}"`,
        item.cost,
        item.currentStock,
        item.avgDailyUsage,
        item.suggestedOrder,
        item.estimatedCost
    ]);

    // Create CSV content with BOM for UTF-8 support
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Du_tru_nhap_hang_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       {/* Controls Header */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <LucideCalendarRange className="text-medical-600" />
                      Lập Dự Trù Nhập Hàng
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                      Tính toán số lượng vật tư cần thiết dựa trên lịch sử tiêu thụ và tồn kho hiện tại.
                  </p>
              </div>
              
              <div className="flex items-center gap-3 bg-blue-50 p-2 rounded-lg border border-blue-100">
                  <span className="text-sm font-medium text-slate-700 whitespace-nowrap pl-2">Số ngày dự trù:</span>
                  <div className="relative">
                      <input 
                        type="number" 
                        min="1"
                        className="w-24 border border-blue-200 rounded-md py-1.5 px-3 text-center font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={forecastDays}
                        onChange={(e) => handleDaysChange(Number(e.target.value) || 0)}
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 pr-2">ngày</span>
              </div>
          </div>
       </div>

       {/* Main Content Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           
           {/* Summary Panel */}
           <div className="lg:col-span-1 space-y-4">
               <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-6 text-white shadow-lg">
                   <div className="flex items-center gap-2 opacity-90 mb-2">
                       <LucideDollarSign size={20} />
                       <span className="text-sm font-medium">Tổng chi phí dự kiến</span>
                   </div>
                   <div className="text-3xl font-bold mb-1">
                       {totalEstimatedCost > 1000000000 
                         ? (totalEstimatedCost / 1000000000).toFixed(2) + ' Tỷ' 
                         : formatCurrency(totalEstimatedCost)}
                   </div>
                   <div className="text-xs opacity-70">
                       Cho {forecastItems.filter(i => i.suggestedOrder > 0).length} mặt hàng cần nhập
                   </div>
               </div>

               <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                   <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                       <LucideCalculator size={18} className="text-gray-400"/>
                       Cách tính toán
                   </h3>
                   <div className="space-y-3 text-sm text-gray-600">
                       <div className="flex justify-between border-b border-gray-50 pb-2">
                           <span>Nhu cầu dự kiến =</span>
                           <span className="font-medium">TB Ngày x Số ngày</span>
                       </div>
                       <div className="flex justify-between border-b border-gray-50 pb-2">
                           <span>Cần nhập =</span>
                           <span className="font-medium">Nhu cầu - Tồn tại</span>
                       </div>
                       <div className="text-xs text-gray-400 italic mt-2">
                           * Nếu kết quả âm, số lượng nhập sẽ là 0.
                       </div>
                   </div>
               </div>
               
               <button 
                onClick={handleExportExcel}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
               >
                   <LucideDownload size={18} /> Xuất Excel
               </button>
           </div>

           {/* Table */}
           <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
               <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                   <h3 className="font-bold text-slate-800">Chi tiết vật tư</h3>
               </div>
               <div className="flex-1 overflow-auto">
                   <table className="w-full text-left border-collapse">
                       <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-semibold text-gray-500 uppercase">
                           <tr>
                               <th className="py-3 px-4">Tên vật tư</th>
                               <th className="py-3 px-4 text-center w-32 bg-blue-50/30">Tồn hiện tại</th>
                               <th className="py-3 px-4 text-center w-32 bg-orange-50/30">TB Tiêu thụ/Ngày</th>
                               <th className="py-3 px-4 text-center w-32 bg-green-50/30">Gợi ý nhập</th>
                               <th className="py-3 px-4 text-right">Thành tiền</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                           {forecastItems.map(item => (
                               <tr key={item.id} className="hover:bg-gray-50">
                                   <td className="py-3 px-4">
                                       <div className="font-medium text-slate-800">{item.name}</div>
                                       <div className="text-xs text-gray-400">Đơn giá: {formatCurrency(item.cost)} / {item.unit}</div>
                                   </td>
                                   <td className="py-3 px-4 text-center bg-blue-50/10">
                                       <input 
                                           type="number" 
                                           min="0"
                                           className="w-20 border border-gray-200 rounded px-2 py-1 text-center text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                           value={item.currentStock}
                                           onChange={(e) => handleItemChange(item.id, 'currentStock', Number(e.target.value))}
                                       />
                                   </td>
                                   <td className="py-3 px-4 text-center bg-orange-50/10">
                                        <input 
                                           type="number" 
                                           min="0"
                                           step="0.1"
                                           className="w-20 border border-gray-200 rounded px-2 py-1 text-center text-sm focus:ring-1 focus:ring-orange-500 outline-none"
                                           value={item.avgDailyUsage}
                                           onChange={(e) => handleItemChange(item.id, 'avgDailyUsage', Number(e.target.value))}
                                       />
                                   </td>
                                   <td className="py-3 px-4 text-center bg-green-50/10">
                                       {item.suggestedOrder > 0 ? (
                                           <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 block w-full">
                                               +{item.suggestedOrder}
                                           </span>
                                       ) : (
                                           <span className="text-gray-400 text-sm">-</span>
                                       )}
                                   </td>
                                   <td className="py-3 px-4 text-right font-medium text-slate-700">
                                       {item.estimatedCost > 0 ? formatCurrency(item.estimatedCost) : '-'}
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
       </div>
    </div>
  );
};