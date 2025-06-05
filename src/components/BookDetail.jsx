
const BookDetail = ({ book }) => {
  return (
    <div className="book-detail">
      <div>
        <img src={book.coverUrl} alt={book.title} />
      </div>
      <div className="reviews">
        {book.reviews && book.reviews.length > 0 ? (
          book.reviews.map((txt, idx) => <p key={idx}>"{txt}"</p>)
        ) : (
          <p>
            <i>No reviews.</i>
          </p>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
