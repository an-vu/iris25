// src/pages/Reader.jsx
import { useParams } from 'react-router-dom';
import books from '../data/books.json';

export default function Reader() {
    const { bookId } = useParams();
    const book = books.find(b => b.id === bookId);

    if (!book) return <div>Book not found</div>;

    return (
        <div>
            <h1>Now reading: {book.title}</h1>
            <p>Author: {book.author}</p>
        </div>
    );
}