import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Box,
  Tooltip,
} from "@mui/material";
import {
  listFiles,
  downloadFile,
  addBook,
  delBook,
  getUserBooks,
} from "./api/s3Api";

function App() {
  const [files, setFiles] = useState([]);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([listFiles(), getUserBooks()])
      .then(([filesData, userData]) => {
        setFiles(filesData.files);
        setUserBooks(userData.user_books);
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

  const handleAdd = async (fileName) => {
    try {
      await addBook(fileName);
      const updated = await getUserBooks();
      setUserBooks(updated.user_books);
    } catch (e) {
      console.error(e);
      alert("Ошибка при добавлении книги");
    }
  };

  const handleRemove = async (fileName) => {
    try {
      await delBook(fileName);
      const updated = await getUserBooks();
      setUserBooks(updated.user_books);
    } catch (e) {
      console.error(e);
      alert("Ошибка при удалении книги");
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

  const displayedFiles = tab === 0 ? files : userBooks;

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        {tab === 0 ? "Все книги" : "Мои книги"}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} centered>
          <Tab label="Все книги" />
          <Tab label={`Мои книги (${userBooks.length})`} />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2 }}>
        <List>
          {displayedFiles.map((f) => {
            const alreadyAdded = userBooks.includes(f);
            return (
              <ListItem
                key={f}
                secondaryAction={
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleDownload(f)}
                      sx={{ mr: 1 }}
                    >
                      Скачать
                    </Button>

                    {tab === 0 ? (
                      <Tooltip
                        title={
                          alreadyAdded ? "Уже добавлена" : "Добавить в мои книги"
                        }
                      >
                        <span>
                          <Button
                            variant="outlined"
                            color={alreadyAdded ? "inherit" : "success"}
                            disabled={alreadyAdded}
                            onClick={() => handleAdd(f)}
                          >
                            ➕
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Удалить из моих книг">
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemove(f)}
                        >
                          ➖
                        </Button>
                      </Tooltip>
                    )}
                  </>
                }
              >
                <ListItemText
                  primary={f}
                  sx={{
                    color: alreadyAdded && tab === 0 ? "gray" : "inherit",
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Container>
  );
}

export default App;
