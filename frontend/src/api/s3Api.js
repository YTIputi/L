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

export async function addBook(fileName) {
  const response = await fetch(`${BASE_URL}/add_book/${encodeURIComponent(fileName)}`);
  if (!response.ok) throw new Error("Ошибка добавления книги");
  return await response.json();
}

export async function delBook(fileName) {
  const response = await fetch(`${BASE_URL}/del_book/${encodeURIComponent(fileName)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Ошибка удаления книги");
  return await response.json();
}

export async function getUserBooks() {
  const response = await fetch(`${BASE_URL}/user_books`);
  if (!response.ok) throw new Error("Ошибка получения списка ваших книг");
  return await response.json();
}