import React, { useMemo, useState } from 'react';
import { UsageRecord } from '../types';
import { LucideCalendar, LucideDollarSign, LucideHistory, LucideSearch, LucideFilter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface UsageHistoryProps {
  records: UsageRecord[];
}

export const UsageHistory: React.FC<UsageHistoryProps> = ({ records }) => {
  // Initialize default date range (Current Month)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = today.toISOString().split('T')[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Filter records based on search term and date range
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = record.itemName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = (!startDate || record.date >= startDate) && 
                          (!endDate || record.date <= endDate);
      return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort new to old
  }, [records, searchTerm, startDate, endDate]);

  const stats = useMemo(() => {
    const totalCost = filteredRecords.reduce((acc, curr) => acc + curr.totalCost, 0);
    const totalItemsUsed = filteredRecords.reduce((acc, curr) => acc + curr.quantity, 0);
    return { totalCost, totalItemsUsed };
  }, [filteredRecords]);

  // Group costs by date for the chart based on filtered data
  const chartData = useMemo(() => {
    const grouped = filteredRecords.reduce((acc, curr) => {
      const date = curr.date;
      acc[date] = (acc[date] || 0) + curr.totalCost;
      return acc;
    }, {} as Record<string, number>);

    // Sort by date ascending for chart
    return Object.keys(grouped)
      .sort()
      .map(date => ({
        date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        cost: grouped[date]
      }));
  }, [filteredRecords]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
         <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <LucideHistory className="text-medical-600" />
                Lịch sử xuất kho
            </h2>
            <p className="text-sm text-gray-500">Theo dõi chi tiết và tìm kiếm lịch sử sử dụng.</p>
         </div>

         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
                <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Tìm tên vật tư..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <div className="flex items-center px-2">
                    <span className="text-xs font-medium text-gray-500 mr-2">Từ:</span>
                    <input 
                        type="date" 
                        className="bg-transparent text-sm text-slate-700 outline-none w-28"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center px-2">
                    <span className="text-xs font-medium text-gray-500 mr-2">Đến:</span>
                    <input 
                        type="date" 
                        className="bg-transparent text-sm text-slate-700 outline-none w-28"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
         {/* Stats Cards */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng chi phí (đang lọc)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(stats.totalCost)}</h3>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <LucideDollarSign size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng số lượt xuất</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{filteredRecords.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <LucideHistory size={24} />
          </div>
        </div>

         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Vật tư tiêu hao</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalItemsUsed}</h3>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <LucideCalendar size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Main List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-slate-800 text-sm uppercase text-gray-500">Chi tiết giao dịch</h3>
          </div>
          <div className="flex-1 overflow-auto">
             <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ngày</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Vật tư</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">SL</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Đơn giá</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(record.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">
                          {record.itemName}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-slate-700 font-bold">
                          {record.quantity}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-500">
                          {formatCurrency(record.costPerUnit)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-indigo-600 font-medium">
                          {formatCurrency(record.totalCost)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                            <LucideFilter className="w-8 h-8 mb-2 opacity-20" />
                            Không tìm thấy dữ liệu phù hợp với bộ lọc.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Biểu đồ chi phí</h3>
          <div className="flex-1 min-h-[200px]">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" fontSize={11} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis fontSize={11} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} name="Chi phí" />
                  </BarChart>
                </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                  Chưa có dữ liệu để hiển thị biểu đồ
               </div>
             )}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Biểu đồ thể hiện tổng chi phí theo ngày trong khoảng thời gian đã chọn.
          </div>
        </div>
      </div>
    </div>
  );
};