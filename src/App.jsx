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

  const fetchBatch = useCallback(
    async (page) => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/books", {
          params: { lang, seed, avgLikes, avgReviews, batch: page },
        });
        const newBooks = response.data.books || [];
        if (page === 1) {
          setBooks(newBooks);
        } else {
          setBooks((prev) => [...prev, ...newBooks]);
        }
        setBatch(page);
        setHasMore(newBooks.length > 0);
      } catch (err) {
        console.error("Error fetching books:", err);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [lang, seed, avgLikes, avgReviews]
  );

  useEffect(() => {
    setBooks([]);
    setBatch(1);
    setHasMore(true);
    fetchBatch(1);
  }, [lang, seed, avgLikes, avgReviews, fetchBatch]);

  const loadMoreBooks = () => {
    if (!isLoading && hasMore) {
      fetchBatch(batch + 1);
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
        >
          <BookTable books={books} />
        </InfiniteScroll>
      </main>
    </div>
  );
}
