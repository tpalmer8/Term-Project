import { useState } from "react";
import { Link } from "react-router-dom";

export default function BookSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  const search = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/search?q=${q}`);
    const data = await res.json();
    setResults(data);
  };

  const addToTBR = async (book) => {
    const userId = localStorage.getItem("userId"); // from login
    await fetch("http://localhost:5000/api/tbr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...book })
    });
    alert("Added to TBR");
  };

  const logout = () => {
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  return (
    <div>
      <button onClick={logout} style={{ marginBottom: "1rem" }}>
        Logout
      </button>
      <h1>Search Books</h1>
      <Link to="/tbr">
        <button>Go to TBR List</button>
      </Link>
      <Link to="/read" style={{ marginLeft: "10px" }}>
        <button>Books Read</button>
      </Link>
      <form onSubmit={search}>
        <input value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      <ul>
        {results.map((b, i) => (
          <li key={i}>
            {b.title} — {b.author}
            <button onClick={() => addToTBR(b)}>Add to TBR</button>
          </li>
        ))}
      </ul>
    </div>
  );
}