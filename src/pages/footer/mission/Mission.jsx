import React from 'react';
import '../FooterPages.css'; // We'll create this shared CSS file later

const Mission = () => {
  return (
    <div className="footer-page">
      <h1>Our Mission</h1>
      <p>At Pet Paradise, our mission is to enhance the lives of pets and their owners by providing high-quality products, expert advice, and a supportive community. We strive to:</p>
      <ul>
        <li>Offer a curated selection of premium pet products</li>
        <li>Educate pet owners on best practices for pet care</li>
        <li>Support animal welfare initiatives and local shelters</li>
        <li>Create a welcoming environment for all pet lovers</li>
      </ul>
      <p>We believe that every pet deserves the best, and we're committed to making that a reality for as many animals as possible.</p>
    </div>
  );
};

export default Mission;