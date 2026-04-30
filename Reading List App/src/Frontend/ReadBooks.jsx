import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ReadBooks() {
  const [list, setList] = useState([]);
  const userId = localStorage.getItem("userId");

  const load = async () => {
    try {
      if (!userId) {
        alert('Please log in first!');
        return;
      }
      const res = await fetch(`http://localhost:5000/api/read/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setList(data);
      } else {
        alert('Error loading read books list');
        console.error('Load error:', res.status);
      }
    } catch (error) {
      alert(`Connection error: ${error.message}`);
      console.error('Load error:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  const rateBook = async (id, rating) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rate/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Rating updated to ${rating} stars!`);
        load(); // refresh list
      } else {
        alert(`Error: ${data.error || 'Failed to update rating'}`);
        console.error('Rate error:', response.status, data);
      }
    } catch (error) {
      alert(`Connection error: ${error.message}`);
      console.error('Rate error:', error);
    }
  };

  return (
    <div>
        <button onClick={logout} style={{ marginBottom: "1rem" }}>
            Logout
        </button>
      <h1>Books You've Read</h1>
      <Link to="/BookSearch">
        <button>Search for More Books</button>
      </Link>
      <Link to="/tbr">
        <button>Go to TBR List</button>
      </Link>
      <ul>
        {list.map((b) => (
          <li key={b.id}>
            {b.title} — {b.author}
            <br />

            Rating:
            {[1, 2, 3, 4, 5].map((num) => (
                <button
                key={num}
                onClick={() => rateBook(b.id, num)}
                style={{
                    color: b.rating >= num ? "gold" : "gray",
                    fontSize: "20px",
                    border: "none",
                    background: "none",
                    cursor: "pointer"
                }}
                >
                ★
                </button>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}