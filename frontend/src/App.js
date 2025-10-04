import React, { useEffect, useState } from "react";
import { listFiles, downloadFile } from "./api/s3Api";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listFiles()
      .then((data) => {
        setFiles(data.files);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
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

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Загружаем файлы...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Список файлов
      </Typography>
      <Paper sx={{ p: 2 }}>
        <List>
          {files.map((f) => (
            <ListItem
              key={f}
              secondaryAction={
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDownload(f)}
                >
                  Скачать
                </Button>
              }
            >
              <ListItemText primary={f} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default App;
