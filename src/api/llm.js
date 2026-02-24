// ============================================
// Module gọi API LLM (Large Language Model)
// Sử dụng dịch vụ Dify/PTIT AI Chat để lấy gợi ý tái chế
// ============================================

// Lấy URL và API Key từ biến môi trường (.env) - KHÔNG hardcode trực tiếp trong mã nguồn
const API_URL = import.meta.env.VITE_LLM_API_URL
const API_KEY = import.meta.env.VITE_LLM_API_KEY

// Kiểm tra xem biến môi trường đã được cấu hình chưa
if (!API_URL || !API_KEY) {
  console.error('❌ Thiếu biến môi trường VITE_LLM_API_URL hoặc VITE_LLM_API_KEY. Vui lòng kiểm tra file .env')
}

/**
 * Gọi API LLM để lấy gợi ý tái chế từ tên loại rác
 * Hàm này gửi tên loại rác lên server AI và nhận về hướng dẫn tái chế dưới dạng JSON
 * @param {string} wasteName - Tên loại rác đã nhận diện (VD: "Chai nhựa", "Giấy báo")
 * @param {string} conversationId - ID hội thoại (dùng để duy trì ngữ cảnh chat, có thể rỗng)
 * @returns {Promise<{ suggestion: object, conversationId: string }>} - Gợi ý tái chế và ID hội thoại
 */
export async function getRecycleIdea(wasteName, conversationId = '') {
  // Chuẩn bị body request gửi lên API
  const requestBody = {
    inputs: {},
    query: wasteName,                        // Câu hỏi gửi cho AI (tên loại rác)
    response_mode: 'blocking',               // Chế độ đồng bộ - đợi phản hồi đầy đủ
    conversation_id: conversationId || '',    // ID hội thoại (rỗng = tạo mới)
    user: 'aireborn',                        // Định danh người dùng
  }
  
  // Gửi request POST đến API LLM với xác thực Bearer Token
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,    // Token xác thực từ biến môi trường
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  // Kiểm tra phản hồi từ server - nếu lỗi thì ném exception
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  let answer = data.answer || ''

  // Trích xuất JSON từ phản hồi AI (AI có thể trả về JSON bọc trong markdown ```json ... ```)
  const jsonMatch = answer.match(/```(?:json)?\s*([\s\S]*?)```/)
  const rawJson = jsonMatch ? jsonMatch[1].trim() : answer.replace(/```json\n|\n```/g, '').trim()

  let suggestion
  try {
    // Phân tích chuỗi JSON thành object JavaScript
    suggestion = JSON.parse(rawJson)
  } catch (parseError) {
    console.error('Lỗi phân tích JSON:', parseError, 'Dữ liệu gốc:', rawJson)
    // Trường hợp dự phòng: nếu không parse được JSON, tạo object mặc định từ text
    suggestion = {
      tenVatDung: wasteName,
      moTaNgan: answer,
      vatLieuCanCo: [],
      cacBuocThucHien: [],
      loiIch: 'Không có thông tin',
      luuYAnToan: 'Vui lòng cẩn thận khi thực hiện',
    }
  }

  // Trả về gợi ý tái chế và ID hội thoại để duy trì ngữ cảnh cho lần gọi tiếp theo
  return {
    suggestion,
    conversationId: data.conversation_id || '',
  }
}
