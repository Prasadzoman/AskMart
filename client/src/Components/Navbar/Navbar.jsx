import { useContext, useState } from 'react'
import { AuthContext } from '../../Context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import ChatBot from '../../Chatbot/Chatbot'
import "./Navbar.css"
import logo from "../Logo/logo.png"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [showChat, setShowChat] = useState(false)
  const navigate = useNavigate()

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <>
      <nav className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="OurFaskMart Logo" />
          </Link>
        </div>

        <div className="nav-center">
          <div className="nav-search">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="search-button" onClick={handleSearch}>
              <i className="fas fa-search" style={{ color: 'white' }}></i>
            </button>
          </div>
        </div>

        <div className="nav-right">
          {!user ? (
            <>
              <div className="nav-login"><Link to="/login" className="nav-btn">Login</Link></div>
              <div className="nav-login"><Link to="/signup" className="nav-btn">Sign Up</Link></div>
            </>
          ) : (
            <>
              <div className="nav-profile">
                <Link to="/profile" className="nav-btn">
                  <i className="fa-solid fa-circle-user"></i> {user.username}
                </Link>
              </div>
              <div className="nav-button">
                <Link onClick={logout} className="nav-btn">Logout</Link>
              </div>
              <div className="nav-button">
                <Link onClick={() => setShowChat(!showChat)} className="nav-btn">
                  <i className="fa-brands fa-rocketchat"></i> Chat
                </Link>
              </div>
            </>
          )}
          <div className="nav-cart"><Link to="/cart" className="nav-btn"><i className="fas fa-shopping-cart"></i></Link></div>
        </div>
      </nav>

      {showChat && (
        <div className="chatbot-wrapper">
          <ChatBot />
        </div>
      )}
    </>
  )
}

export default Navbar
