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