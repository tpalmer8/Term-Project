import { useState } from 'react';

export default function Home() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const addToTBR = async (book) => {
    await fetch('http://localhost:5000/api/tbr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    alert('Added to TBR');
  };

  return (
    <div style={{ maxWidth: 800, margin: '1rem auto' }}>
      <h1>Book Search</h1>
      <form onSubmit={search}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search books..."
          style={{ width: '70%' }}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}

      <ul>
        {results.map((b, i) => (
          <li key={i} style={{ marginTop: 10 }}>
            <strong>{b.title}</strong> — {b.author}
            <button style={{ marginLeft: 10 }} onClick={() => addToTBR(b)}>
              Add to TBR
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
