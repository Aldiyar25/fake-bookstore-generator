import { useState, useEffect, useCallback } from "react";
import "./App.css";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Controls from "./components/Controls.jsx";
import BookTable from "./components/BookTable.jsx";
export default function App() {
  const [lang, setLang] = useState("en");
  const [seed, setSeed] = useState("1");
  const [avgLikes, setAvgLikes] = useState(5);
  const [avgReviews, setAvgReviews] = useState(3);

  const [books, setBooks] = useState([]);
  const [batch, setBatch] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchKey = `${lang}|${seed}|${avgLikes}|${avgReviews}`;

  const fetchBooksBatch = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/books", {
        params: {
          lang,
          seed,
          avgLikes,
          avgReviews,
          batch,
        },
      });
      const data = response.data;
      const newBooks = Array.isArray(data.books) ? data.books : [];

      if (batch === 1) {
        setBooks(newBooks);
      } else {
        setBooks((prev) => [...prev, ...newBooks]);
      }
      setBatch((prev) => prev + 1);
      setHasMore(true);
    } catch (err) {
      console.error("Ошибка при загрузке книг:", err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [lang, seed, avgLikes, avgReviews, batch]);

  useEffect(() => {
    setBooks([]);
    setBatch(1);
    setHasMore(true);
  }, [fetchKey]);

  useEffect(() => {
    if (batch === 1 && books.length === 0) {
      fetchBooksBatch();
    }
  }, [batch, books.length, fetchBooksBatch]);

  const loadMoreBooks = () => {
    if (!isLoading) {
      fetchBooksBatch();
    }
  };

  const handleExportCsv = () => {
    const count = books.length;
    const url = `/api/books/export?lang=${lang}&seed=${encodeURIComponent(
      seed
    )}&avgLikes=${avgLikes}&avgReviews=${avgReviews}&count=${count}`;
    window.location.href = url;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Fake Bookstore Generator</h1>
      </header>

      <Controls
        lang={lang}
        onLangChange={setLang}
        seed={seed}
        onSeedChange={setSeed}
        avgLikes={avgLikes}
        onAvgLikesChange={setAvgLikes}
        avgReviews={avgReviews}
        onAvgReviewsChange={setAvgReviews}
        onExportCsv={handleExportCsv}
      />

      <main>
        <InfiniteScroll
          dataLength={books.length}
          next={loadMoreBooks}
          hasMore={hasMore}
          loader={<h4 className="loader">Loading...</h4>}
          scrollThreshold={0.9}
          key={fetchKey}
        >
          <BookTable books={books} />
        </InfiniteScroll>
      </main>
    </div>
  );
}
