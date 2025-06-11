import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'


export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/me', { withCredentials: true })
        setUser(res.data)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])


  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:5000/login', { username, password }, { withCredentials: true })
      setUser({ username: res.data.username })
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Login failed' }
    }
  }


  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true })
      setUser(null)
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
