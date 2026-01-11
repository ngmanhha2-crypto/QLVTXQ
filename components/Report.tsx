import React, { useState, useMemo } from 'react';
import { InventoryItem, UsageRecord, ImportRecord } from '../types';
import { LucideFileChartColumn, LucideDownload, LucideCalendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Line } from 'recharts';

interface ReportProps {
  inventory: InventoryItem[];
  usageHistory: UsageRecord[];
  importHistory: ImportRecord[];
}

export const Report: React.FC<ReportProps> = ({ inventory, usageHistory, importHistory }) => {
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Logic to calculate movement per item
  const reportData = useMemo(() => {
    return inventory.map(item => {
        // 1. Filter history within range
        const itemImports = importHistory.filter(r => r.itemId === item.id && r.date >= startDate && r.date <= endDate);
        const itemUsage = usageHistory.filter(r => r.itemId === item.id && r.date >= startDate && r.date <= endDate);

        // 2. Calculate Totals for period
        const importQty = itemImports.reduce((acc, curr) => acc + curr.quantity, 0);
        const importValue = itemImports.reduce((acc, curr) => acc + curr.totalCost, 0);
        
        const exportQty = itemUsage.reduce((acc, curr) => acc + curr.quantity, 0);
        const exportValue = itemUsage.reduce((acc, curr) => acc + curr.totalCost, 0);

        // 3. Reconstruct Opening Stock (Tồn đầu kỳ)
        // Opening = Current + Total Export (After EndDate + During Range) - Total Import (After EndDate + During Range)
        // Simplified Logic: 
        // Current Stock is known.
        // We look at all transactions AFTER the endDate to wind back from Current to Closing Stock.
        const allImportsAfterEnd = importHistory.filter(r => r.itemId === item.id && r.date > endDate);
        const allUsageAfterEnd = usageHistory.filter(r => r.itemId === item.id && r.date > endDate);
        
        const qtyImportsAfter = allImportsAfterEnd.reduce((acc, curr) => acc + curr.quantity, 0);
        const qtyUsageAfter = allUsageAfterEnd.reduce((acc, curr) => acc + curr.quantity, 0);

        // Closing Stock (Tồn cuối kỳ báo cáo) = Current - ImportsAfter + UsageAfter
        const closingStock = item.quantity - qtyImportsAfter + qtyUsageAfter;

        // Opening Stock (Tồn đầu kỳ báo cáo) = Closing - Imports(In Range) + Usage(In Range)
        const openingStock = closingStock - importQty + exportQty;

        return {
            id: item.id,
            name: item.name,
            unit: item.unit,
            openingStock,
            importQty,
            importValue,
            exportQty,
            exportValue,
            closingStock
        };
    });
  }, [inventory, usageHistory, importHistory, startDate, endDate]);

  // Chart Data: Top 10 items by movement (Import + Export)
  const chartData = useMemo(() => {
      return [...reportData]
        .sort((a, b) => (b.importQty + b.exportQty) - (a.importQty + a.exportQty))
        .slice(0, 10)
        .map(item => ({
            name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
            Nhập: item.importQty,
            Xuất: item.exportQty,
            Tồn: item.closingStock
        }));
  }, [reportData]);

  // Summary Stats
  const summary = useMemo(() => {
      return reportData.reduce((acc, curr) => ({
          totalImportValue: acc.totalImportValue + curr.importValue,
          totalExportValue: acc.totalExportValue + curr.exportValue,
          totalImportQty: acc.totalImportQty + curr.importQty,
          totalExportQty: acc.totalExportQty + curr.exportQty
      }), { totalImportValue: 0, totalExportValue: 0, totalImportQty: 0, totalExportQty: 0 });
  }, [reportData]);

  const handleExportExcel = () => {
    // Define headers
    const headers = [
        "Mã VT",
        "Tên vật tư", 
        "Đơn vị", 
        "Tồn đầu kỳ", 
        "SL Nhập", 
        "Giá trị Nhập", 
        "SL Xuất", 
        "Giá trị Xuất", 
        "Tồn cuối kỳ"
    ];

    // Map data to rows
    const rows = reportData.map(item => [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`, // Handle commas/quotes
        `"${item.unit}"`,
        item.openingStock,
        item.importQty,
        item.importValue,
        item.exportQty,
        item.exportValue,
        item.closingStock
    ]);

    // Create CSV content with BOM for UTF-8 support
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_cao_XNT_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
            <div>
                 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <LucideFileChartColumn className="text-medical-600" />
                      Báo Cáo Xuất Nhập Tồn
                  </h2>
                  <p className="text-sm text-gray-500">Thống kê chi tiết vật tư trong khoảng thời gian.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                    <LucideCalendar size={16} className="text-gray-500"/>
                    <span className="text-sm font-medium text-gray-600">Từ:</span>
                    <input 
                        type="date" 
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-medical-500"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Đến:</span>
                    <input 
                        type="date" 
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-medical-500"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Charts & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
            <div className="lg:col-span-1 space-y-4">
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                     <h3 className="font-semibold text-gray-700 mb-4">Tổng quan kỳ báo cáo</h3>
                     <div className="space-y-4">
                         <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                             <span className="text-sm text-gray-500">Giá trị nhập kho</span>
                             <span className="font-bold text-blue-600">{formatCurrency(summary.totalImportValue)}</span>
                         </div>
                         <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                             <span className="text-sm text-gray-500">Giá trị xuất kho</span>
                             <span className="font-bold text-orange-600">{formatCurrency(summary.totalExportValue)}</span>
                         </div>
                         <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                             <span className="text-sm text-gray-500">SL Nhập</span>
                             <span className="font-medium">{summary.totalImportQty}</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <span className="text-sm text-gray-500">SL Xuất</span>
                             <span className="font-medium">{summary.totalExportQty}</span>
                         </div>
                     </div>
                 </div>
                 
                 <button 
                  onClick={handleExportExcel}
                  className="w-full bg-medical-600 hover:bg-medical-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                 >
                   <LucideDownload size={18} /> Tải báo cáo Excel
                 </button>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-700 mb-4">Biểu đồ biến động (Top 10 vật tư)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="name" fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false}/>
                            <YAxis fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false}/>
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            />
                            <Legend />
                            <Bar dataKey="Nhập" fill="#3b82f6" barSize={20} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Xuất" fill="#f97316" barSize={20} radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="Tồn" stroke="#10b981" strokeWidth={2} dot={{r: 3}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
               <h3 className="font-bold text-slate-800">Chi tiết Xuất - Nhập - Tồn</h3>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-semibold text-gray-500 uppercase">
                        <tr>
                            <th className="py-3 px-4 min-w-[200px]">Tên vật tư</th>
                            <th className="py-3 px-4 text-center">ĐVT</th>
                            <th className="py-3 px-4 text-center text-slate-600 bg-gray-100">Tồn đầu</th>
                            <th className="py-3 px-4 text-center text-blue-700 bg-blue-50">Nhập</th>
                            <th className="py-3 px-4 text-center text-orange-700 bg-orange-50">Xuất</th>
                            <th className="py-3 px-4 text-center text-green-700 bg-green-50">Tồn cuối</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reportData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-slate-800">{item.name}</td>
                                <td className="py-3 px-4 text-center text-sm text-gray-500">{item.unit}</td>
                                <td className="py-3 px-4 text-center font-semibold text-gray-600 bg-gray-50/50">{item.openingStock}</td>
                                <td className="py-3 px-4 text-center font-medium text-blue-600 bg-blue-50/30">{item.importQty > 0 ? `+${item.importQty}` : '-'}</td>
                                <td className="py-3 px-4 text-center font-medium text-orange-600 bg-orange-50/30">{item.exportQty > 0 ? `-${item.exportQty}` : '-'}</td>
                                <td className="py-3 px-4 text-center font-bold text-green-700 bg-green-50/30">{item.closingStock}</td>
                            </tr>
                        ))}
                         {reportData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-400">Không có dữ liệu trong khoảng thời gian này.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};