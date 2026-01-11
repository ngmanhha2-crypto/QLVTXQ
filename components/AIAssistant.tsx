import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { analyzeInventory } from '../services/geminiService';
import { LucideSparkles, LucideLoader2, LucideBot, LucideRefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  inventory: InventoryItem[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ inventory }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeInventory(inventory);
      setReport(result || "Không nhận được phản hồi từ AI.");
    } catch (error) {
      setReport("Đã xảy ra lỗi khi kết nối với hệ thống AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Control Panel */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <LucideBot size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Trợ lý Kho Thông Minh</h2>
            <p className="text-sm text-gray-500">Được hỗ trợ bởi Google Gemini</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <p className="text-gray-600 leading-relaxed text-sm">
            AI sẽ phân tích toàn bộ dữ liệu kho hàng hiện tại của bạn để tìm ra các mẫu tiêu thụ, cảnh báo thiếu hụt tiềm ẩn và đề xuất kế hoạch đặt hàng tối ưu.
          </p>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">Khả năng của AI:</h4>
            <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4">
              <li>Phát hiện vật tư dưới mức an toàn.</li>
              <li>Tính toán số lượng cần đặt dựa trên hệ số an toàn.</li>
              <li>Đề xuất ưu tiên xử lý cho kỹ thuật viên/thủ kho.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleAnalysis}
          disabled={loading}
          className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
            loading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:scale-[1.02]'
          }`}
        >
          {loading ? (
            <>
              <LucideLoader2 className="animate-spin" /> Đang phân tích...
            </>
          ) : (
            <>
              <LucideSparkles /> Tạo Báo Cáo Phân Tích
            </>
          )}
        </button>
      </div>

      {/* Report View */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8 overflow-auto relative">
        {!report && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <LucideBot size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-medium opacity-60">Chưa có dữ liệu phân tích</p>
            <p className="text-sm max-w-xs mt-2 opacity-50">Nhấn nút "Tạo Báo Cáo Phân Tích" để AI kiểm tra kho hàng của bạn.</p>
          </div>
        )}

        {loading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
              <LucideLoader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
              <p className="text-indigo-800 font-medium animate-pulse">Đang đọc dữ liệu kho & tính toán...</p>
           </div>
        )}

        {report && (
          <div className="prose prose-slate prose-sm max-w-none">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
               <h3 className="text-xl font-bold text-slate-800 m-0">Kết quả phân tích</h3>
               <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                 {new Date().toLocaleString('vi-VN')}
               </span>
            </div>
            
            {/* Render Markdown */}
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-indigo-900 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-indigo-700" {...props} />,
                p: ({node, ...props}) => <p className="text-slate-600 mb-4 leading-relaxed" {...props} />,
              }}
            >
              {report}
            </ReactMarkdown>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
              <button 
                onClick={handleAnalysis}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-2"
              >
                <LucideRefreshCcw size={14} /> Cập nhật lại báo cáo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};