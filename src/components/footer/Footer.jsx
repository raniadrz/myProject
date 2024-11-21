import { Link } from "react-router-dom";
import logo from "../../photos/logo.png";
import './Footer.css';

const Footer = () => {
  // Δυναμικό Έτος
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Λογότυπο */}
          <div className="footer-logo">
            <img 
              src={logo} 
              alt="Pet Paradise Logo" 
              loading="lazy" // Lazy loading για καλύτερη απόδοση
            />
            <h1>Pet Paradise</h1>
          </div>

          {/* Πλοήγηση */}
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
                <li><a href="https://instagram.com" aria-label="Instagram">Instagram</a></li>
                <li><a href="https://linkedin.com" aria-label="LinkedIn">LinkedIn</a></li>
                <li><a href="https://youtube.com" aria-label="YouTube">YouTube</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Κάτω Μέρος */}
        <div className="footer-bottom">
          <p>Copyright © {currentYear} Pet Paradise</p>
          <div className="footer-bottom-links">
            <Link to="/terms">Terms of Service</Link>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Smooth Scroll
              className="back-to-top" 
              aria-label="Back to Top" // Accessibility
            >
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
