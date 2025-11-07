async function search(text) {
  try {
    const response = await fetch(`/search?text=${encodeURIComponent(text)}`);
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