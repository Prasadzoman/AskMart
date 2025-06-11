
import './App.css'
import Landing from './Landing/Landing'
import Navbar from './Components/Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Show from './Show/Show'
import Login from './Login/Login'
import Signup from './Signup/Signup'
import Profile from './Profile/Profile'
import Cart from './Cart/Cart'
import ChatBot from './Chatbot/Chatbot'
import Footer from './Components/Footer/Footer'
import SearchResults from './SearchResults/SearchResults'
function App() {

  return (
    <>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/product/:id" element={<Show />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/chat" element={<ChatBot />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
      <Footer></Footer>
    </>
  )
}

export default App
