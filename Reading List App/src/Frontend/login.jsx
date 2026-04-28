import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
          alert('Login successful!');
          navigate('/'); // redirect after login
        } else {
          setErrors({ submit: data.message });
        }
      } catch (error) {
        setErrors({ submit: 'Failed to connect to server: ' + error.message });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: '2rem auto' }}>
      <div>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        {errors.username && <div style={{ color: 'red' }}>{errors.username}</div>}
      </div>

      <div style={{ marginTop: 10 }}>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
      </div>

      {errors.submit && <div style={{ color: 'red', marginTop: 10 }}>{errors.submit}</div>}

      <button type="submit" disabled={loading} style={{ marginTop: 15, width: '100%' }}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {/* Register Button */}
      <button
        type="button"
        onClick={() => navigate('/register')}
        style={{ marginTop: 10, width: '100%' }}
      >
        Register
      </button>

      {/* Forgot Password Button */}
      <button
        type="button"
        onClick={() => navigate('/forgot-password')}
        style={{
          marginTop: 10,
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: 'blue',
          textDecoration: 'underline',
          cursor: 'pointer'
        }}
      >
        Forgot Password?
      </button>
    </form>
  );
}