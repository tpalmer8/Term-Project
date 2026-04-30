import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function TBR() {
  const [list, setList] = useState([]);
  const userId = localStorage.getItem("userId");

  const load = async () => {
    try {
      if (!userId) {
        alert("Please log in first!");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/tbr/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setList(data);
      } else {
        alert("Error loading TBR list");
      }
    } catch (error) {
      alert(`Connection error: ${error.message}`);
      console.error("Load error:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tbr/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok) {
        load();
      } else {
        alert(`Error: ${data.error || "Failed to remove book"}`);
      }
    } catch (error) {
      alert(`Connection error: ${error.message}`);
      console.error("Remove error:", error);
    }
  };

  const markRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/mark-read/${id}`, {
        method: "POST"
      });
      const data = await response.json();
      if (response.ok) {
        alert("Book marked as read!");
        load(); // refresh list
      } else {
        alert(`Error: ${data.error || "Failed to mark as read"}`);
      }
    } catch (error) {
      alert(`Connection error: ${error.message}`);
      console.error("Mark as read error:", error);
    }
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
      <h1>Your TBR List</h1>
      <Link to="/BookSearch">
        <button>Search for More Books</button>
      </Link>
      <Link to="/read" style={{ marginLeft: "10px" }}>
        <button>Books Read</button>
      </Link>

      <ul>
        {list.map((b) => (
          <li key={b.id}>
            {b.title} — {b.author}
            <button onClick={() => remove(b.id)}>Remove</button>
            <button onClick={() => markRead(b.id)}>Mark as Read</button>
          </li>
        ))}
      </ul>
    </div>
  );
}