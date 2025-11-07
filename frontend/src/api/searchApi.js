const API_BASE = "http://127.0.0.1:8000"; // или твой адрес бекенда

export async function search(text) {
  try {
    const response = await fetch(`${API_BASE}/search?text=${encodeURIComponent(text)}`);
    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.status}`);
    }
    const data = await response.json();
    console.log("Результаты поиска:", data.results);
    return data.results;
  } catch (error) {
    console.error("Ошибка при вызове search:", error);
    throw error;
  }
}
