import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/signup', {
        username,
        email,
        password
      }, { withCredentials: true })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Sign Up</h2>
      {error && <p style={styles.error}>{error}</p>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={styles.input}
      />

      <button type="submit" style={styles.button}>Sign Up</button>
    </form>
  )
}

const styles = {
  form: {
    maxWidth: '400px',
    margin: '50px auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '10px',
    fontSize: '16px'
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#2c7a7b',
    color: '#fff',
    border: 'none',
    cursor: 'pointer'
  },
  error: {
    color: 'red'
  }
}

export default Signup
