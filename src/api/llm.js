const API_URL = 'https://aichat.ptit.edu.vn/v1/chat-messages'
const API_KEY = 'Bearer app-M8VZInDYwONaXsRyK9GYrtIq'

/**
 * Gọi API LLM để lấy gợi ý tái chế từ tên loại rác
 * @param {string} wasteName - Tên loại rác đã nhận diện
 * @param {string} conversationId - ID hội thoại (có thể rỗng)
 * @returns {Promise<{ suggestion: object, conversationId: string }>}
 */
export async function getRecycleIdea(wasteName, conversationId = '') {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: wasteName,
      response_mode: 'blocking',
      conversation_id: conversationId || '',
      user: 'aireborn',
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  let answer = data.answer || ''

  // Parse JSON từ answer (có thể bọc trong ```json ... ```)
  const jsonMatch = answer.match(/```(?:json)?\s*([\s\S]*?)```/)
  const rawJson = jsonMatch ? jsonMatch[1].trim() : answer.replace(/```json\n|\n```/g, '').trim()

  let suggestion
  try {
    suggestion = JSON.parse(rawJson)
    // Debug log để kiểm tra
    console.log('Parsed suggestion:', suggestion)
  } catch (parseError) {
    console.error('Parse JSON error:', parseError, 'Raw JSON:', rawJson)
    // Fallback: trả về dạng text
    suggestion = {
      tenVatDung: wasteName,
      moTaNgan: answer,
      vatLieuCanCo: [],
      cacBuocThucHien: [],
      loiIch: 'Không có thông tin',
      luuYAnToan: 'Vui lòng cẩn thận khi thực hiện',
    }
  }

  return {
    suggestion,
    conversationId: data.conversation_id || '',
  }
}
