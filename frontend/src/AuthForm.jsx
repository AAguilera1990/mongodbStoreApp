import { useState } from 'react';
import axios from 'axios';

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login'); // or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = mode === 'login' ? '/login' : '/register';

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        username,
        password
      });

      if (mode === 'login') {
        localStorage.setItem('token', res.data.token);
        setFeedback('✅ Login successful!');
        onAuth(true); // Notify parent App
      } else {
        setFeedback('✅ Registered! You can now log in.');
        setMode('login');
      }

    } catch (err) {
      setFeedback(`❌ ${err.response?.data?.error || 'Request failed'}`);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ margin: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ margin: '0.5rem' }}
        />
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      <p>{feedback}</p>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
    </div>
  );
}

export default AuthForm;
