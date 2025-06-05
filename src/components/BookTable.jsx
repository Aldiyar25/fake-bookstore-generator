import BookRow from "./BookRow.jsx";

export default function BookTable({ books = [] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>ISBN</th>
          <th>Title</th>
          <th>Author</th>
          <th>Publisher</th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <BookRow
            key={`${book.id}|${book.title}|${book.author}`}
            book={book}
          />
        ))}
      </tbody>
    </table>
  );
}
