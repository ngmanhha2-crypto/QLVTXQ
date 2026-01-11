import React, { useMemo } from 'react';
import { InventoryItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { 
  LucideAlertTriangle, 
  LucidePackage, 
  LucideTrendingDown, 
  LucideDollarSign, 
  LucideActivity,
  LucideAlertOctagon
} from 'lucide-react';

interface DashboardProps {
  inventory: InventoryItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ inventory }) => {
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(i => i.quantity <= i.minLevel);
    const criticalItems = inventory.filter(i => i.quantity === 0);
    const totalStockCount = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
    // Calculate estimated total value of inventory
    const totalValue = inventory.reduce((acc, curr) => acc + (curr.quantity * curr.cost), 0);

    return { totalItems, lowStockItems, criticalItems, totalStockCount, totalValue };
  }, [inventory]);

  // 1. CHART: Top 5 Lowest Stock Ratio (Quantity / MinLevel)
  // This helps identify items that are critically low relative to their specific requirements.
  const stockHealthData = useMemo(() => {
    return [...inventory]
      .filter(item => item.minLevel > 0) // Avoid division by zero
      .map(item => ({
        name: item.name,
        ratio: parseFloat((item.quantity / item.minLevel).toFixed(2)), // 1.0 = 100% of min level
        quantity: item.quantity,
        minLevel: item.minLevel,
        unit: item.unit
      }))
      .sort((a, b) => a.ratio - b.ratio) // Ascending: Lowest ratio first
      .slice(0, 5);
  }, [inventory]);

  // 2. CHART: Category Distribution (Value based)
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    inventory.forEach(item => {
      if (!data[item.category]) data[item.category] = 0;
      data[item.category] += (item.quantity * item.cost);
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [inventory]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
  };

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Tổng quan kho hàng</h2>
           <p className="text-sm text-gray-500">Cập nhật tình hình vật tư và tài sản theo thời gian thực.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
           Hôm nay: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Value */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <LucideDollarSign size={64} className="text-indigo-600"/>
          </div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng giá trị tồn kho</p>
              <h3 className="text-2xl font-bold text-indigo-900 mt-2">{formatCurrency(stats.totalValue)}</h3>
              <p className="text-xs text-indigo-600 mt-1 font-medium flex items-center gap-1">
                 <LucideActivity size={12}/> Ước tính hiện tại
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <LucideDollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Total Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Danh mục vật tư</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">{stats.totalItems}</h3>
              <p className="text-xs text-gray-400 mt-1">
                 Tổng số lượng: {stats.totalStockCount}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <LucidePackage size={24} />
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className={`rounded-xl p-6 shadow-sm border relative ${stats.lowStockItems.length > 0 ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${stats.lowStockItems.length > 0 ? 'text-orange-700' : 'text-gray-500'}`}>Cần nhập hàng</p>
              <h3 className={`text-2xl font-bold mt-2 ${stats.lowStockItems.length > 0 ? 'text-orange-800' : 'text-slate-800'}`}>
                  {stats.lowStockItems.length}
              </h3>
              <p className={`text-xs mt-1 ${stats.lowStockItems.length > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                 Dưới mức tối thiểu
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stats.lowStockItems.length > 0 ? 'bg-white text-orange-600 shadow-sm' : 'bg-orange-50 text-orange-600'}`}>
              <LucideTrendingDown size={24} />
            </div>
          </div>
        </div>

        {/* Critical */}
        <div className={`rounded-xl p-6 shadow-sm border relative ${stats.criticalItems.length > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${stats.criticalItems.length > 0 ? 'text-red-700' : 'text-gray-500'}`}>Hết hàng (Critical)</p>
              <h3 className={`text-2xl font-bold mt-2 ${stats.criticalItems.length > 0 ? 'text-red-800' : 'text-slate-800'}`}>
                  {stats.criticalItems.length}
              </h3>
              <p className={`text-xs mt-1 ${stats.criticalItems.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                 Tồn kho bằng 0
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stats.criticalItems.length > 0 ? 'bg-white text-red-600 shadow-sm' : 'bg-red-50 text-red-600'}`}>
              <LucideAlertOctagon size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NEW CHART: Top 5 Lowest Stock Ratio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col">
          <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <LucideAlertTriangle className="text-orange-500" size={20}/>
                Top 5 Cảnh Báo Khẩn Cấp
              </h3>
              <p className="text-sm text-gray-500">
                Các vật tư có tỷ lệ tồn kho thấp nhất so với định mức an toàn (Số lượng / Mức tối thiểu).
              </p>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={stockHealthData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                <XAxis type="number" hide />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150} 
                    tick={{fontSize: 12, fill: '#475569'}}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm">
                          <p className="font-bold text-slate-800 mb-1">{data.name}</p>
                          <div className="space-y-1">
                             <p className="text-gray-600">Hiện có: <span className="font-semibold">{data.quantity} {data.unit}</span></p>
                             <p className="text-gray-600">Tối thiểu: <span className="font-semibold">{data.minLevel} {data.unit}</span></p>
                             <p className={`font-bold ${data.ratio < 0.5 ? 'text-red-600' : 'text-orange-500'}`}>
                                Tỷ lệ: {(data.ratio * 100).toFixed(0)}%
                             </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={1} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Mức an toàn (100%)', position: 'top', fill: '#94a3b8', fontSize: 10 }} />
                <Bar dataKey="ratio" barSize={20} radius={[0, 4, 4, 0]} background={{ fill: '#f1f5f9' }}>
                    {stockHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.ratio < 0.5 ? '#ef4444' : entry.ratio < 1 ? '#f97316' : '#10b981'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart: Value by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Phân bổ giá trị kho</h3>
          <p className="text-sm text-gray-500 mb-6">Tỷ trọng giá trị theo nhóm hàng.</p>
          
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Low Stock List (Detailed) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Chi tiết vật tư cần nhập thêm</h3>
            {stats.lowStockItems.length === 0 && (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <LucideActivity size={16}/> Kho đang ở trạng thái tốt
                </span>
            )}
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                   <tr>
                      <th className="px-6 py-3">Tên vật tư</th>
                      <th className="px-6 py-3">Danh mục</th>
                      <th className="px-6 py-3 text-center">Định mức tối thiểu</th>
                      <th className="px-6 py-3 text-center">Tồn hiện tại</th>
                      <th className="px-6 py-3 text-right">Trạng thái</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {stats.lowStockItems.length > 0 ? (
                       stats.lowStockItems.map(item => (
                           <tr key={item.id} className="hover:bg-gray-50">
                               <td className="px-6 py-3 font-medium text-slate-700">{item.name}</td>
                               <td className="px-6 py-3 text-gray-500">{item.category}</td>
                               <td className="px-6 py-3 text-center text-gray-500">{item.minLevel} {item.unit}</td>
                               <td className="px-6 py-3 text-center font-bold text-slate-800">{item.quantity} {item.unit}</td>
                               <td className="px-6 py-3 text-right">
                                   {item.quantity === 0 ? (
                                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                           Hết hàng
                                       </span>
                                   ) : (
                                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                           Thấp
                                       </span>
                                   )}
                               </td>
                           </tr>
                       ))
                   ) : (
                       <tr>
                           <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                               Không có vật tư nào dưới mức tối thiểu.
                           </td>
                       </tr>
                   )}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};