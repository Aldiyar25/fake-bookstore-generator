
import { useState } from "react";
import BookDetail from "./BookDetail.jsx";

const BookGallery = ({ books, fetchKey }) => {
  const [selectedId, setSelectedId] = useState(null);
  const selectedBook = books.find((b) => b.id === selectedId);
  return (
    <>
      <div className="gallery-grid">
        {books.map((book) => {
          return (
            <div
              key={`${fetchKey}-${book.id}`}
              className="book-card"
              onClick={() => setSelectedId(book.id)}
            >
              <img src={book.coverUrl} alt={book.title} />
              <div className="card-body">
                <div style={{ fontWeight: "bold" }}>{book.title}</div>
                <div style={{ color: "#555" }}>{book.author}</div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedBook && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setSelectedId(null)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              width: "80%",
              maxWidth: "500px",
              margin: "5% auto",
              padding: "1rem",
              borderRadius: "4px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <BookDetail book={selectedBook} />
            <button
              onClick={() => setSelectedId(null)}
              style={{ marginTop: "1rem" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookGallery;
