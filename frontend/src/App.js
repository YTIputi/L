import React, { useEffect, useState } from "react";
import { listFiles, downloadFile } from "./api/s3Api";

function App() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    listFiles()
      .then(data => setFiles(data.files))
      .catch(console.error);
  }, []);

  const handleDownload = async (fileName) => {
    try {
      const blob = await downloadFile(fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Ошибка при скачивании файла");
    }
  };

  return (
    <div>
      <h1>Список файлов</h1>
      <ul>
        {files.map((f) => (
          <li key={f}>
            {f} <button onClick={() => handleDownload(f)}>Скачать</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
