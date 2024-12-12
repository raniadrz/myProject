import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import HomePageProductCard from "../../components/homePageProductCard/HomePageProductCard";
import Layout from "../../components/layout/Layout";
import SearchByTitle from "../../components/searchBar/SearchBar";
import Testimonial from "../../components/testimonial/Testimonial";
import "./HomePage.css";
import pet2 from './photos/pet.png';
import pet1 from './photos/pet2.png';
import pet3 from './photos/pet3.png';

const HomePage = () => {
  const [open, setOpen] = useState(false); // For testimonials dialog
  const [popupVisible, setPopupVisible] = useState(true); // For the project message popup
  const navigate = useNavigate();



  // Handle open/close for the testimonial dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Automatically hide the popup after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setPopupVisible(false);
    }, 3000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Add this function to handle navigation
  const handleGetStarted = () => {
    // Scroll to the HomePageProductCard section
    const productSection = document.getElementById('product-section');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
    // navigate to a specific route
    navigate('/products');
  };

  return (
    <Layout>  
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>The best place to get your favorite pet without any doubt</h1>
          <p>At Pet Paradise, we offer essentials to keep your pets happy, healthy, and loved.</p>
          <button 
            className="get-started-btn"
            onClick={handleGetStarted}
          >
            Get Started Now →
          </button>
        </div>
        
        {/* Pet showcase carousel */}
        <div className="pet-showcase">
          <div className="pet-card">
            <img src={pet1} alt="dog" />
          </div>
          <div className="pet-card active">
            <img src={pet2} alt="bunny" />
          </div>
          <div className="pet-card">
            <img src={pet3} alt="cat" />
          </div>
          <div className="carousel-dots">
            <span className="dot"></span>
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>
        </div>
      </section>     
      <Testimonial limit={3} />
    </Layout>
  );
};

export default HomePage;
