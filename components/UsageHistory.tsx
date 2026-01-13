import React from 'react';
import { UsageRecord, ImportRecord } from '../types';
import { LucideArrowDownCircle, LucideArrowUpCircle } from 'lucide-react';

interface UsageHistoryProps {
  usageRecords: UsageRecord[];
  importRecords: ImportRecord[];
}

export const UsageHistory: React.FC<UsageHistoryProps> = ({
  usageRecords,
  importRecords,
}) => {
  const totalUsageCost = usageRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const totalImportCost = importRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Tổng quan chi phí */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">
              Chi phí sử dụng vật tư
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-800">
              {totalUsageCost.toLocaleString('vi-VN')} đ
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Tính theo các lần xuất dùng đã ghi nhận
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
            <LucideArrowUpCircle className="w-6 h-6 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">
              Chi phí nhập vật tư
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-800">
              {totalImportCost.toLocaleString('vi-VN')} đ
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Tính theo các lần nhập kho đã ghi nhận
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <LucideArrowDownCircle className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Lịch sử sử dụng vật tư */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Lịch sử sử dụng vật tư
            </h2>
            <p className="text-xs text-slate-500">
              Các lần xuất dùng / tiêu hao vật tư
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                  Ngày
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                  Vật tư
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">
                  Số lượng
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">
                  Đơn giá
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {usageRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-xs text-slate-400"
                  >
                    Chưa có dữ liệu sử dụng vật tư.
                  </td>
                </tr>
              )}
              {usageRecords.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-slate-50/60">
                  <td className="px-4 py-2 align-top text-xs text-slate-700">
                    {r.date}
                  </td>
                  <td className="px-4 py-2 align-top text-xs text-slate-800">
                    {r.itemName}
                  </td>
                  <td className="px-4 py-2 align-top text-right text-xs text-slate-700">
                    {r.quantity.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-2 align-top text-right text-xs text-slate-700">
                    {r.costPerUnit.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-2 align-top text-right text-xs font-semibold text-slate-900">
                    {r.totalCost.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lịch sử nhập vật tư */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Lịch sử nhập vật tư
            </h2>
            <p className="text-xs text-slate-500">
              Các lần nhập kho / bổ sung tồn kho
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                  Ngày
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                  Vật tư
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">
                  Số lượng
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">
                  Đơn giá
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {importRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-xs text-slate-400"
                  >
                    Chưa có dữ liệu nhập vật tư.
                  </td>
                </tr>
              )}
              {importRecords.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-slate-50/60">
                  <td className="px-4 py-2 align-top text-xs text-slate-700">
                    {r.date}
                  </td>
                  <td className="px-4 py-2 align-top text-xs text-slate-800">
                    {r.itemName}
                  </td>
                  <td className="px-4 py-2 align-top text-right text-xs text-slate-700">
                    {r.quantity.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-2 align-top text-right text-xs text-slate-700">
                    {r.costPerUnit.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-2 align-top text-right text-xs font-semibold text-slate-900">
                    {r.totalCost.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
