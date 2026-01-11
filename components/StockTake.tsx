import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { LucideSearch, LucideCheck, LucideAlertTriangle, LucideClipboardCheck } from 'lucide-react';

interface StockTakeProps {
  inventory: InventoryItem[];
  onRecordUsage: (itemId: string, quantity: number, date: string) => void;
}

export const StockTake: React.FC<StockTakeProps> = ({ inventory, onRecordUsage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state to track which items are being checked
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [actualQuantity, setActualQuantity] = useState<number>(0);
  const [checkDate, setCheckDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectForCheck = (item: InventoryItem) => {
      setSelectedItem(item);
      setActualQuantity(item.quantity);
      setCheckDate(new Date().toISOString().split('T')[0]);
  }

  const handleStockTakeSubmit = () => {
    if (!selectedItem) return;

    const diff = selectedItem.quantity - actualQuantity;

    if (diff > 0) {
        // System has more than actual => Usage happened (Consume stock)
        onRecordUsage(selectedItem.id, diff, checkDate);
        setSelectedItem(null);
    } else if (diff < 0) {
        // Actual has more than system => Surplus
        alert("Cảnh báo: Số lượng thực tế lớn hơn số liệu hệ thống. Vui lòng kiểm tra lại phiếu nhập hoặc sử dụng chức năng 'Nhập thêm' để điều chỉnh.");
    } else {
        // Equal
        setSelectedItem(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* List Section */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <LucideClipboardCheck size={20} className="text-medical-600"/> 
                 Danh sách kiểm kê
             </h3>
             <div className="relative">
                <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Tìm vật tư..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
        </div>
        
        <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tên vật tư</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Vị trí</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Hệ thống</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredInventory.map(item => (
                        <tr key={item.id} className={`hover:bg-gray-50 cursor-pointer ${selectedItem?.id === item.id ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`} onClick={() => handleSelectForCheck(item)}>
                            <td className="py-3 px-4">
                                <div className="font-medium text-slate-800">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.category}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{item.location}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-700">{item.quantity} {item.unit}</td>
                            <td className="py-3 px-4 text-center">
                                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Kiểm tra</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Input Section */}
      <div className="lg:col-span-1">
          {selectedItem ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-100 pb-3">
                     Nhập liệu kiểm kê
                 </h3>
                 
                 <div className="mb-6">
                     <p className="text-sm text-gray-500 mb-1">Đang kiểm tra:</p>
                     <p className="text-xl font-bold text-medical-700">{selectedItem.name}</p>
                     <div className="flex justify-between items-center mt-2 p-3 bg-gray-50 rounded-lg">
                         <span className="text-sm text-gray-600">Tồn hệ thống:</span>
                         <span className="font-bold text-slate-800">{selectedItem.quantity} {selectedItem.unit}</span>
                     </div>
                 </div>

                 <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng thực tế</label>
                        <input 
                            type="number" 
                            min="0"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-medical-500 outline-none text-xl font-bold text-center"
                            value={actualQuantity}
                            onChange={e => setActualQuantity(Number(e.target.value))}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kiểm kê</label>
                        <input 
                            type="date" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                            value={checkDate}
                            onChange={e => setCheckDate(e.target.value)}
                        />
                     </div>

                     {/* Live Diff Preview */}
                     <div className="pt-2">
                        {(() => {
                            const diff = selectedItem.quantity - actualQuantity;
                            if (diff > 0) {
                                return (
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
                                        <div className="flex items-start gap-2">
                                            <LucideCheck className="text-green-600 mt-0.5" size={16} />
                                            <div>
                                                <p className="text-green-800 font-semibold">Chênh lệch: {diff} {selectedItem.unit}</p>
                                                <p className="text-green-700 text-xs mt-1">
                                                    Sẽ ghi nhận <strong>xuất dùng {diff} {selectedItem.unit}</strong>.
                                                </p>
                                                <p className="text-green-800 font-medium mt-1">
                                                    Giá trị: {formatCurrency(diff * selectedItem.cost)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else if (diff < 0) {
                                return (
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
                                        <div className="flex items-start gap-2">
                                            <LucideAlertTriangle className="text-red-600 mt-0.5" size={16} />
                                            <div>
                                                <p className="text-red-800 font-semibold">Thừa {Math.abs(diff)} {selectedItem.unit}</p>
                                                <p className="text-red-700 text-xs mt-1">
                                                    Thực tế {actualQuantity} > Hệ thống {selectedItem.quantity}.
                                                    <br/>Vui lòng kiểm tra lại phiếu nhập.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="text-center text-sm text-gray-500 py-2 italic bg-gray-50 rounded-lg">
                                        Khớp số liệu.
                                    </div>
                                );
                            }
                        })()}
                     </div>

                     <div className="flex gap-3 pt-4">
                        <button 
                            onClick={() => setSelectedItem(null)}
                            className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleStockTakeSubmit}
                            disabled={selectedItem.quantity - actualQuantity <= 0}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold shadow-sm ${
                                selectedItem.quantity - actualQuantity > 0 
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Xác nhận
                        </button>
                     </div>
                 </div>
              </div>
          ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center h-64 flex flex-col items-center justify-center text-gray-400">
                  <LucideClipboardCheck size={48} className="opacity-20 mb-4"/>
                  <p>Chọn một vật tư từ danh sách bên trái để bắt đầu kiểm kê.</p>
              </div>
          )}
      </div>
    </div>
  );
};
