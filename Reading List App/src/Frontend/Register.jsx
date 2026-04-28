import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/demographics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (data.id) {
        alert('Registration successful!');
        navigate('/login');
      } else {
        setErrors({ submit: 'Registration failed' });
      }
    } catch (err) {
      setErrors({ submit: 'Failed to connect to server: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: '2rem auto' }}>
      <h2>Register</h2>

      {Object.keys(form).map((key) => (
        <div key={key} style={{ marginTop: 10 }}>
          <label>
            {key.charAt(0).toUpperCase() + key.slice(1)}:
            <input
              type="text"
              name={key}
              value={form[key]}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </label>
        </div>
      ))}

      {errors.submit && <div style={{ color: 'red', marginTop: 10 }}>{errors.submit}</div>}

      <button type="submit" disabled={loading} style={{ marginTop: 15, width: '100%' }}>
        {loading ? 'Registering...' : 'Register'}
      </button>

      <button
        type="button"
        onClick={() => navigate('/login')}
        style={{ marginTop: 10, width: '100%' }}
      >
        Back to Login
      </button>
    </form>
  );
}
