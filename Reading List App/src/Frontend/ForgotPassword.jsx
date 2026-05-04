import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [lastName, setLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          lastName: lastName || null,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        setUsername('');
        setLastName('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrors({ submit: data.message || 'Password reset failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Error connecting to server. Please try again.' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1>Reset Your Password</h1>
        <p>Enter your username and a new password to reset your account</p>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">First Name</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your first name"
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name (Optional - for extra verification)</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              className={errors.newPassword ? 'error' : ''}
            />
            {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <button type="submit" disabled={loading} className="reset-button">
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="footer-links">
          <p>
            Remember your password? <Link to="/login">Back to Login</Link>
          </p>
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
