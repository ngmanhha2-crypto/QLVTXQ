import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { LucideSearch, LucidePlus, LucideTrash2, LucideFilter, LucidePlusCircle, LucideClipboardList, LucideUpload, LucideAlertCircle, LucideArrowRight, LucideCheck, LucidePencil, LucideAlertTriangle } from 'lucide-react';

interface InventoryListProps {
  inventory: InventoryItem[];
  onUpdateStock: (id: string, delta: number) => void;
  onAddItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onRecordUsage: (itemId: string, quantity: number, date: string) => void;
}

// Definition of available fields for mapping
const IMPORT_FIELDS: { key: keyof Omit<InventoryItem, 'id'> | 'totalCost'; label: string; type: 'string' | 'number' }[] = [
  { key: 'name', label: 'Tên vật tư', type: 'string' },
  { key: 'category', label: 'Danh mục', type: 'string' },
  { key: 'quantity', label: 'Số lượng', type: 'number' },
  { key: 'unit', label: 'Đơn vị', type: 'string' },
  { key: 'minLevel', label: 'Mức tối thiểu', type: 'number' },
  { key: 'location', label: 'Vị trí', type: 'string' },
  { key: 'cost', label: 'Đơn giá', type: 'number' },
  { key: 'totalCost', label: 'Thành tiền', type: 'number' },
];

export const InventoryList: React.FC<InventoryListProps> = ({ inventory, onUpdateStock, onAddItem, onEditItem, onDeleteItem, onRecordUsage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modal State (Used for both Add and Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentItem, setCurrentItem] = useState<Partial<InventoryItem>>({
    category: 'Vật tư y tế',
    quantity: 0,
    minLevel: 10,
    unit: 'Cái',
    location: 'Tất cả',
    cost: 0
  });

  // State for suggestions visibility
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Usage Modal State
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [selectedItemForUsage, setSelectedItemForUsage] = useState<InventoryItem | null>(null);
  const [usageAmount, setUsageAmount] = useState<number>(1);
  const [usageDate, setUsageDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  // Bulk Import State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkPasteContent, setBulkPasteContent] = useState('');
  const [importStep, setImportStep] = useState<'input' | 'mapping'>('input');
  const [rawImportRows, setRawImportRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});
  const [hasHeaderRow, setHasHeaderRow] = useState(true);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate suggestions based on input
  const nameSuggestions = currentItem.name && currentItem.name.length > 0
    ? inventory.filter(i => 
        i.name.toLowerCase().includes(currentItem.name!.toLowerCase()) && 
        i.name !== currentItem.name 
      ).slice(0, 5) 
    : [];

  const handleSelectSuggestion = (item: InventoryItem) => {
    setCurrentItem({
        ...currentItem,
        name: item.name,
        category: item.category,
        unit: item.unit,
        minLevel: item.minLevel,
        location: item.location,
        cost: item.cost,
    });
    setShowSuggestions(false);
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentItem({
        category: 'Vật tư y tế',
        quantity: 0,
        minLevel: 10,
        unit: 'Cái',
        location: 'Tất cả',
        cost: 0
    });
    setIsModalOpen(true);
  }

  const openEditModal = (item: InventoryItem) => {
    setModalMode('edit');
    setCurrentItem({ ...item });
    setIsModalOpen(true);
  }

  const handleSaveItem = () => {
    if (currentItem.name && currentItem.quantity !== undefined && currentItem.minLevel !== undefined) {
      if (modalMode === 'add') {
        onAddItem({
            id: Date.now().toString(),
            name: currentItem.name,
            category: currentItem.category as any,
            quantity: Number(currentItem.quantity),
            unit: currentItem.unit || 'Cái',
            minLevel: Number(currentItem.minLevel),
            location: currentItem.location || 'Tất cả',
            cost: Number(currentItem.cost) || 0
        });
      } else {
        // Edit mode
        onEditItem(currentItem as InventoryItem);
      }
      setIsModalOpen(false);
    }
  };

  const openUsageModal = (item: InventoryItem) => {
    setSelectedItemForUsage(item);
    setUsageAmount(1);
    setUsageDate(new Date().toISOString().split('T')[0]);
    setIsUsageModalOpen(true);
  };

  const handleRecordUsage = () => {
    if (selectedItemForUsage && usageAmount > 0) {
      onRecordUsage(selectedItemForUsage.id, usageAmount, usageDate);
      setIsUsageModalOpen(false);
      setSelectedItemForUsage(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setItemToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDeleteId) {
        onDeleteItem(itemToDeleteId);
        setIsDeleteModalOpen(false);
        setItemToDeleteId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // --- Bulk Import Logic ---
  const processRawInput = () => {
    if (!bulkPasteContent.trim()) return;
    const rows = bulkPasteContent.trim().split('\n').map(line => line.split('\t'));
    const validRows = rows.filter(r => r.some(cell => cell.trim() !== ''));
    setRawImportRows(validRows);
    
    const initialMapping: Record<number, string> = {};
    if (validRows.length > 0) {
        if(validRows[0].length > 0) initialMapping[0] = 'name';
        if(validRows[0].length > 1) initialMapping[1] = 'category';
        if(validRows[0].length > 2) initialMapping[2] = 'quantity';
    }
    setColumnMapping(initialMapping);
    setImportStep('mapping');
  };

  const handleColumnMapChange = (colIndex: number, fieldKey: string) => {
    setColumnMapping(prev => {
        if (fieldKey === '') {
            const next = { ...prev };
            delete next[colIndex];
            return next;
        }
        return { ...prev, [colIndex]: fieldKey };
    });
  };

  const handleExecuteImport = () => {
    const dataRows = hasHeaderRow ? rawImportRows.slice(1) : rawImportRows;
    dataRows.forEach((row, idx) => {
        const item: any = {
            id: `import-${Date.now()}-${idx}`,
            name: 'Chưa đặt tên',
            category: 'Vật tư y tế',
            quantity: 0,
            minLevel: 0,
            unit: 'Cái',
            location: 'Tất cả',
            cost: 0
        };
        Object.entries(columnMapping).forEach(([colIdx, fieldKey]) => {
            const rawValue = row[parseInt(colIdx)];
            if (rawValue !== undefined) {
                const fieldDef = IMPORT_FIELDS.find(f => f.key === fieldKey);
                if (fieldDef) {
                    if (fieldDef.type === 'number') {
                        item[fieldDef.key] = parseInt(rawValue.replace(/[^0-9-]/g, '')) || 0;
                    } else {
                        item[fieldDef.key] = rawValue.trim();
                    }
                }
            }
        });

        // Calculate cost from totalCost if needed
        if (item.totalCost && item.quantity > 0 && !item.cost) {
            item.cost = Math.round(item.totalCost / item.quantity);
        }
        delete item.totalCost;

        // Auto-fill cost/unit from existing inventory if missing in import data
        if (item.name) {
            const existingItem = inventory.find(i => i.name.toLowerCase() === item.name.toLowerCase());
            if (existingItem) {
                 if (!item.cost || item.cost === 0) {
                     item.cost = existingItem.cost;
                 }
                 // If unit is default or missing, take from existing
                 if (!item.unit || item.unit === 'Cái') {
                     item.unit = existingItem.unit;
                 }
            }
        }

        if (item.name && item.name !== 'Chưa đặt tên') {
            onAddItem(item);
        }
    });
    setBulkPasteContent('');
    setRawImportRows([]);
    setImportStep('input');
    setIsBulkImportOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm vật tư..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
             <LucideFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
             <select 
               className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 appearance-none bg-white"
               value={categoryFilter}
               onChange={(e) => setCategoryFilter(e.target.value)}
             >
               <option value="all">Tất cả danh mục</option>
               <option value="Vật tư y tế">Vật tư y tế</option>
               <option value="Thuốc">Thuốc</option>
               <option value="Văn phòng phẩm">Văn phòng phẩm</option>
             </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsBulkImportOpen(true)}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
          >
            <LucideUpload size={18} />
            Nhập Excel
          </button>
          <button 
            onClick={openAddModal}
            className="bg-medical-600 hover:bg-medical-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
          >
            <LucidePlusCircle size={18} />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên vật tư</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Đơn giá</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tồn kho</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Đơn vị</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInventory.map((item) => {
               const isLow = item.quantity <= item.minLevel;
               return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{item.name}</div>
                    {isLow && <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded">Sắp hết hàng</span>}
                    <div className="text-xs text-gray-400 mt-0.5">
                       {item.location}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.category === 'Vật tư y tế' ? 'bg-blue-100 text-blue-700' :
                      item.category === 'Thuốc' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-600 font-medium">
                    {formatCurrency(item.cost)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
                      {item.quantity}
                    </span>
                    <span className="text-xs text-gray-400 block">Min: {item.minLevel}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">{item.unit}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openUsageModal(item)}
                        className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md text-xs font-medium transition-colors"
                        title="Xuất dùng / Ghi nhận sử dụng"
                      >
                         <LucideClipboardList size={14} /> Xuất
                      </button>
                      
                      <div className="h-4 w-px bg-gray-200 mx-1"></div>
                      
                      <button 
                        onClick={() => openEditModal(item)}
                        className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded transition-colors"
                        title="Chỉnh sửa thông tin"
                      >
                        <LucidePencil size={16} />
                      </button>

                      <button 
                        onClick={() => onUpdateStock(item.id, 1)}
                        className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-500 rounded transition-colors"
                        title="Nhập thêm nhanh"
                      >
                        <LucidePlus size={16} />
                      </button>
                      <button 
                         onClick={() => openDeleteModal(item.id)}
                         className="p-1.5 hover:bg-gray-100 text-gray-300 hover:text-gray-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                         title="Xóa vật tư"
                      >
                         <LucideTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                  Không tìm thấy vật tư phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Usage Modal */}
      {isUsageModalOpen && selectedItemForUsage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xuất kho sử dụng</h3>
            <p className="text-sm text-gray-500 mb-4">Ghi nhận việc sử dụng vật tư vào hệ thống.</p>
            
            <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
               <div className="font-medium text-slate-800">{selectedItemForUsage.name}</div>
               <div className="text-xs text-gray-500 flex justify-between mt-1">
                  <span>Tồn hiện tại: {selectedItemForUsage.quantity} {selectedItemForUsage.unit}</span>
                  <span>Giá: {formatCurrency(selectedItemForUsage.cost)}</span>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng xuất</label>
                  <input 
                    type="number" 
                    min="1"
                    max={selectedItemForUsage.quantity}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-medical-500 outline-none"
                    value={usageAmount}
                    onChange={e => setUsageAmount(Number(e.target.value))}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sử dụng</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                    value={usageDate}
                    onChange={e => setUsageDate(e.target.value)}
                  />
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsUsageModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleRecordUsage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
              >
                Xác nhận xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
             <div className="flex items-center gap-3 mb-4 text-red-600">
                <div className="bg-red-50 p-2 rounded-full">
                    <LucideAlertTriangle size={24} /> 
                </div>
                <h3 className="text-lg font-bold text-slate-800">Xác nhận xóa</h3>
             </div>
             <p className="text-gray-600 mb-6 text-sm">
                Bạn có chắc chắn muốn xóa vật tư này khỏi kho không? <br/>
                Hành động này không thể hoàn tác.
             </p>
             <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm"
                >
                  Xóa vĩnh viễn
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
               <div>
                 <h3 className="text-lg font-bold text-slate-800">Nhập dữ liệu từ Excel</h3>
                 <p className="text-sm text-gray-500">
                    {importStep === 'input' 
                      ? 'Sao chép dữ liệu từ Excel/Google Sheets và dán vào bên dưới.' 
                      : 'Xác định các cột dữ liệu tương ứng.'}
                 </p>
               </div>
               <button onClick={() => { setIsBulkImportOpen(false); setImportStep('input'); setBulkPasteContent(''); setRawImportRows([]); }} className="text-gray-400 hover:text-gray-600">
                 <LucidePlus className="rotate-45" size={24}/>
               </button>
            </div>
            
            <div className="p-6 flex-1 overflow-auto">
              {importStep === 'input' ? (
                <textarea 
                  className="w-full h-64 border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-medical-500 outline-none resize-none whitespace-pre"
                  placeholder={`Ví dụ:\nTên hàng\tSố lượng\tĐơn giá\nPhim 35x43\t100\t50000\n...`}
                  value={bulkPasteContent}
                  onChange={(e) => setBulkPasteContent(e.target.value)}
                ></textarea>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                     <input 
                       type="checkbox" 
                       id="hasHeader" 
                       checked={hasHeaderRow} 
                       onChange={(e) => setHasHeaderRow(e.target.checked)}
                       className="rounded text-medical-600 focus:ring-medical-500"
                     />
                     <label htmlFor="hasHeader" className="text-sm text-slate-700 font-medium select-none cursor-pointer">
                        Dòng đầu tiên là tiêu đề
                     </label>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-auto flex-1 relative">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                        <tr>
                            {rawImportRows.length > 0 && rawImportRows[0].map((_, colIdx) => (
                                <th key={colIdx} className="p-2 border-b border-gray-200 min-w-[150px]">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-500 font-normal uppercase tracking-wide">Cột {colIdx + 1}</span>
                                        <select 
                                            className="w-full text-sm border rounded p-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={columnMapping[colIdx] || ''}
                                            onChange={(e) => handleColumnMapChange(colIdx, e.target.value)}
                                        >
                                            <option value="">-- Bỏ qua --</option>
                                            {IMPORT_FIELDS.map(field => (
                                                <option key={field.key} value={field.key}>{field.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rawImportRows.map((row, rowIdx) => {
                            const isHeader = hasHeaderRow && rowIdx === 0;
                            return (
                                <tr key={rowIdx} className={`hover:bg-gray-50 ${isHeader ? 'bg-gray-50 opacity-50' : ''}`}>
                                    {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className="p-3 border-r border-gray-100 last:border-r-0 text-gray-500">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => { setIsBulkImportOpen(false); setImportStep('input'); setBulkPasteContent(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Hủy bỏ
              </button>
              {importStep === 'input' ? (
                <button 
                  onClick={processRawInput}
                  disabled={!bulkPasteContent.trim()}
                  className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 text-sm font-medium flex items-center gap-2"
                >
                  Tiếp tục <LucideArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleExecuteImport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm flex items-center gap-2"
                >
                  <LucideCheck size={16} />
                  Hoàn tất
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
                {modalMode === 'add' ? 'Thêm vật tư mới' : 'Chỉnh sửa vật tư'}
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên vật tư</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-medical-500 outline-none"
                  value={currentItem.name || ''}
                  onChange={e => {
                      setCurrentItem({...currentItem, name: e.target.value});
                      if(modalMode === 'add') setShowSuggestions(true);
                  }}
                  onFocus={() => { if(modalMode === 'add') setShowSuggestions(true); }}
                  onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                      // Auto-fill details if exact name match found
                      if (modalMode === 'add' && currentItem.name) {
                          const exactMatch = inventory.find(i => i.name.toLowerCase() === currentItem.name!.trim().toLowerCase());
                          if (exactMatch) {
                              setCurrentItem(prev => ({
                                  ...prev,
                                  cost: (prev.cost === 0) ? exactMatch.cost : prev.cost,
                                  unit: (prev.unit === 'Cái' || !prev.unit) ? exactMatch.unit : prev.unit,
                                  category: exactMatch.category,
                                  minLevel: (prev.minLevel === 10) ? exactMatch.minLevel : prev.minLevel,
                                  location: (prev.location === 'Tất cả') ? exactMatch.location : prev.location
                              }));
                          }
                      }
                  }}
                />
                
                {/* Suggestions Dropdown (Only for Add Mode) */}
                {modalMode === 'add' && showSuggestions && nameSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 shadow-lg rounded-lg mt-1 max-h-48 overflow-auto">
                        <ul>
                            {nameSuggestions.map(item => (
                                <li 
                                    key={item.id}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelectSuggestion(item);
                                    }}
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                >
                                    <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                                    <div className="text-xs text-gray-400 flex justify-between">
                                        <span>{item.category} • {item.unit}</span>
                                        <span>{item.location}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                   <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                      value={currentItem.category}
                      onChange={e => setCurrentItem({...currentItem, category: e.target.value as any})}
                   >
                     <option value="Vật tư y tế">Vật tư y tế</option>
                     <option value="Thuốc">Thuốc</option>
                     <option value="Văn phòng phẩm">Văn phòng phẩm</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                   <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                    value={currentItem.unit}
                    onChange={e => setCurrentItem({...currentItem, unit: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                      value={currentItem.quantity}
                      onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức tối thiểu</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                      value={currentItem.minLevel}
                      onChange={e => setCurrentItem({...currentItem, minLevel: Number(e.target.value)})}
                    />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Nơi sử dụng</label>
                   <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                      value={currentItem.location}
                      onChange={e => setCurrentItem({...currentItem, location: e.target.value as any})}
                   >
                     <option value="Tất cả">Tất cả</option>
                     <option value="Phòng chụp X quang">Phòng chụp X quang</option>
                     <option value="Phòng chụp Cắt lớp vi tính">Phòng chụp Cắt lớp vi tính</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá (VND)</label>
                   <input 
                     type="number" 
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                     value={currentItem.cost}
                     onChange={e => setCurrentItem({...currentItem, cost: Number(e.target.value)})}
                   />
                 </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSaveItem}
                className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700"
              >
                {modalMode === 'add' ? 'Lưu vật tư' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};