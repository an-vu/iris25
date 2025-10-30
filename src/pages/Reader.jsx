// src/pages/Reader.jsx

import { useParams, useNavigate } from "react-router-dom";

export default function Reader() {
    const { bookId } = useParams();
    const navigate = useNavigate();

    return (
        <div>
            <h1>Reader Page</h1>
            <p>Currently reading book ID: {bookId}</p>
            <button onClick={() => navigate("/")}>Back to Home</button>
        </div>
    );
}
