const BASE_URL = "http://127.0.0.1:8000";

export async function downloadFile(fileName) {
  const response = await fetch(`${BASE_URL}/download/${encodeURIComponent(fileName)}`);
  if (!response.ok) throw new Error("Ошибка загрузки файла");
  const blob = await response.blob();
  return blob;
}

export async function listFiles() {
  const response = await fetch(`${BASE_URL}/files`);
  if (!response.ok) throw new Error("Ошибка получения списка файлов");
  return await response.json();
}
