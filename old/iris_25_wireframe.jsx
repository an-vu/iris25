// src/data/books.json
[
  {
    "id": "1",
    "title": "Book One",
    "author": "Author A"
  },
  {
    "id": "2",
    "title": "Book Two",
    "author": "Author B"
  },
  {
    "id": "3",
    "title": "Book Three",
    "author": "Author C"
  }
]

// src/components/BookCard.jsx
import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  return (
    <div>
      <h2>{book.title}</h2>
      <p>{book.author}</p>
      <Link to={`/reader/${book.id}`}>
        <button>Read</button>
      </Link>
    </div>
  );
}

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

// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Reader from './pages/Reader';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reader/:bookId" element={<Reader />} />
      </Routes>
    </BrowserRouter>
  );
}

// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// public/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Iris 25</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
