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
  TextField,
} from "@mui/material";
import {
  listFiles,
  downloadFile,
  addBook,
  delBook,
  getUserBooks,
} from "./api/s3Api";
import { search } from "./api/searchApi"; // ✅ импорт функции поиска

function App() {
  const [files, setFiles] = useState([]);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  // 🔍 для поиска
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

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

  // 🔍 Поиск
  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      const results = await search(query);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
      alert("Ошибка при поиске");
    } finally {
      setSearching(false);
    }
  };

  // очистка поиска при смене вкладки
  useEffect(() => {
    setSearchResults([]);
    setQuery("");
  }, [tab]);

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

  // если есть результаты поиска — показываем только их
  const displayedFiles =
    searchResults.length > 0
      ? searchResults.map(
          (r) => r.file_name || r.title || r.name || JSON.stringify(r)
        )
      : tab === 0
      ? files
      : userBooks;

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        {tab === 0 ? "Все книги" : "Мои книги"}
      </Typography>

      {/* 🔍 Поле поиска */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Поиск"
          variant="outlined"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={searching}
        >
          {searching ? "Ищем..." : "Поиск"}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} centered>
          <Tab label="Все книги" />
          <Tab label={`Мои книги (${userBooks.length})`} />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2 }}>
        {displayedFiles.length === 0 ? (
          <Typography variant="body1" align="center" color="text.secondary">
            {searchResults.length > 0
              ? "Ничего не найдено"
              : "Файлы отсутствуют"}
          </Typography>
        ) : (
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
                            alreadyAdded
                              ? "Уже добавлена"
                              : "Добавить в мои книги"
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
        )}
      </Paper>
    </Container>
  );
}

export default App;
