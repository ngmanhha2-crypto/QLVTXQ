import { GoogleGenAI } from "@google/genai";
import { InventoryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeInventory = async (inventory: InventoryItem[]) => {
  try {
    const inventoryData = JSON.stringify(inventory);
    
    const prompt = `
      Bạn là một chuyên gia quản lý kho vật tư y tế cho khoa Chẩn đoán hình ảnh (X-quang, CT).
      Dựa trên dữ liệu tồn kho hiện tại dưới đây (định dạng JSON), hãy cung cấp một báo cáo phân tích ngắn gọn và hữu ích bằng tiếng Việt.

      Dữ liệu kho:
      ${inventoryData}

      Yêu cầu đầu ra (Định dạng Markdown):
      1. **Cảnh báo khẩn cấp**: Liệt kê các vật tư đang ở dưới mức tối thiểu (quantity < minLevel). Tính toán số lượng cần đặt thêm để đạt mức an toàn (ví dụ: an toàn = minLevel * 1.5).
      2. **Phân tích tình trạng**: Đánh giá tổng quan về sức khỏe của kho hàng hiện tại.
      3. **Đề xuất hành động**: Đưa ra 3 hành động cụ thể mà thủ kho nên làm ngay hôm nay.

      Hãy dùng giọng văn chuyên nghiệp, ngắn gọn, trực diện.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Không thể kết nối với AI. Vui lòng kiểm tra API Key hoặc thử lại sau.";
  }
};

export const askChatbot = async (history: string[], question: string, inventory: InventoryItem[]) => {
    try {
        const context = `
        Dữ liệu kho hiện tại: ${JSON.stringify(inventory)}
        Lịch sử chat: ${history.join('\n')}
        
        Trả lời câu hỏi của người dùng dựa trên dữ liệu trên. Giữ câu trả lời ngắn gọn.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `${context}\nUser: ${question}`,
        });
        return response.text;
    } catch (error) {
        console.error("Chat Error", error);
        return "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu.";
    }
}
