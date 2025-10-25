import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in both fields.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <button type="submit" style={{ width: '100%' }}>Login</button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      <p style={{ marginTop: '1rem' }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
