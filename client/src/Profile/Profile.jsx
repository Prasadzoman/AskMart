import React, { useContext } from 'react'
import { AuthContext } from '../Context/AuthContext'

const Profile = () => {
  const { user, logout } = useContext(AuthContext)

  if (!user) return <div>Please login</div>

  return (
    <div>
      <h2>Welcome, {user.username}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default Profile
