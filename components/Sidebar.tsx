import React from 'react';
import { LucideLayoutDashboard, LucidePackage, LucideBot, LucideActivity, LucideHistory, LucideClipboardCheck, LucideCalendarRange, LucideFileChartColumn } from 'lucide-react';
import { TabView } from '../types';

interface SidebarProps {
  currentTab: TabView;
  onTabChange: (tab: TabView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const menuItems: { id: TabView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LucideLayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Kho vật tư', icon: <LucidePackage size={20} /> },
    { id: 'stock-take', label: 'Kiểm kê', icon: <LucideClipboardCheck size={20} /> },
    { id: 'forecast', label: 'Tạo dự trù', icon: <LucideCalendarRange size={20} /> },
    { id: 'report', label: 'Báo cáo', icon: <LucideFileChartColumn size={20} /> },
    { id: 'usage', label: 'Lịch sử & Chi phí', icon: <LucideHistory size={20} /> },
    { id: 'ai-assistant', label: 'Trợ lý AI', icon: <LucideBot size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <LucideActivity className="text-medical-500 mr-3" />
        <span className="font-bold text-lg tracking-wide">RadInvent</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              currentTab === item.id
                ? 'bg-medical-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
          <p className="mb-1 font-semibold text-slate-300">Trạng thái hệ thống</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Online
          </div>
          <div className="mt-2 text-[10px] opacity-70">
             Phiên bản 1.4.0
          </div>
        </div>
      </div>
    </aside>
  );
};