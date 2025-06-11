import "./Footer.css";
import { Link } from "react-router-dom";
import logo from "../Logo/logo.png"
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section brand">
          <img src={logo} alt="" />
          <p>Your one-stop destination for smarter shopping.</p>
        </div>

        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/"><i className="fas fa-home"></i> Home</Link></li>
            <li><Link to="/cart"><i className="fas fa-shopping-cart"></i> Cart</Link></li>
            <li><Link to="/profile"><i className="fas fa-user"></i> Profile</Link></li>
            <li><Link to="/login"><i className="fas fa-sign-in-alt"></i> Login</Link></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h4>Contact Us</h4>
          <p><i className="fas fa-envelope"></i> support@ouraskmart.com</p>
          <p><i className="fas fa-phone-alt"></i> +91 98765 43210</p>

          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AskMart. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
