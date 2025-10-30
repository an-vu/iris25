// src/pages/Home.jsx
import books from '../data/books.json';
import BookCard from '../components/BookCard';

export default function Home() {
return (
<div>
<h1>Bookshelf</h1>
{books.map(book => (
<BookCard key={book.id} book={book} />
))}
</div>
);
}