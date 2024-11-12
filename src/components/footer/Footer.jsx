import { Link } from "react-router-dom";
import logo from "../../photos/logo.png";
import './Footer.css';  // Import the CSS file

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo Section */}
          <div className="footer-logo">
            <img src={logo} alt="Pet Paradise Logo" />
            <h1>Pet Paradise</h1>
          </div>

          {/* Navigation Sections */}
          <div className="footer-nav">
            {/* About Us Section */}
            <div className="footer-section">
              <h2>About Us</h2>
              <ul>
                <li><Link to="/mission">Mission</Link></li>
                <li><Link to="/team">Team</Link></li>
                <li><Link to="/newsletter">Newsletter</Link></li>
              </ul>
            </div>

            {/* Support Section */}
            <div className="footer-section">
              <h2>Support</h2>
              <ul>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/refund-policy">Refund Policy</Link></li>
                <li><Link to="/faqs">FAQ's</Link></li>
              </ul>
            </div>

            {/* Social Section */}
            <div className="footer-section">
              <h2>Social</h2>
              <ul>
                <li><a href="https://instagram.com">Instagram</a></li>
                <li><a href="https://linkedin.com">LinkedIn</a></li>
                <li><a href="https://youtube.com">YouTube</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>Copyright © Pet Paradise</p>
          <div className="footer-bottom-links">
            <Link to="/terms">Terms of Service</Link>
            <button onClick={() => window.scrollTo(0, 0)} className="back-to-top">
              Back to top
              <span>↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;