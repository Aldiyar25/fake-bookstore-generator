import { useState } from "react";
import "../App.css";
function BookRow({ book }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        style={{ cursor: "pointer" }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <td>{book.id}</td>
        <td>{book.isbn}</td>
        <td>{book.title}</td>
        <td>{book.author}</td>
        <td>
          {book.publisher}, {book.year}
        </td>
      </tr>

      {expanded && (
        <tr className="book-row-details">
          <td colSpan={7}>
            <div className="details-container">
              <div className="cover-container">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={`Cover for ${book.title}`}
                    className="cover-img"
                  />
                ) : (
                  <div className="cover-placeholder">Loading cover…</div>
                )}
              </div>

              <div className="info-container">
                <h2>
                  {book.title} <em>Paperback</em>
                </h2>
                <p>
                  by <strong>{book.author}</strong>
                </p>
                <p>{book.publisher}</p>

                <div className="reviews-block">
                  <h3>Review</h3>
                  {book.reviewsCount === 0 ? (
                    <em>No reviews</em>
                  ) : (
                    book.reviews.map((r, i) => (
                      <div key={i}>
                        <strong>{r.reviewer}:</strong> {r.text} <br />
                        <small>— {r.company}</small>
                      </div>
                    ))
                  )}
                </div>
                <div className="likes-block">
                  <span className="likes-icon">👍</span>
                  <span className="likes-count">{book.likes}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
export default BookRow;
