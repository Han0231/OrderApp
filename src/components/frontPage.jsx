import React from 'react';

import Navbar from './Navbar'; // Import the Navbar component
import temporary from "./imageFiles/BIG_GHEE.png";
import './front.css';

function FrontPage() {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="front-page-content">
        <div className="content-wrapper">
          {/* Text Section */}
          <div className="text-section">
            <div className="frame-4">
              <div className="toyko-delight-ramen">TOYKO DELIGHT RAMEN</div>
            </div>

            <div className="rich-savory-and-authentic">Rich, Savory, and Authentic</div>

            <div className="frame-6">
              <div className="experience-the-perfect-blend-of-tender-noodles-flavorful-broth-and-fresh-toppings-a-taste-of-japan-in-every-bite">
                Experience the perfect blend of tender noodles, flavorful broth, and fresh toppings. A taste of Japan in every bite!
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="image-section">
            <img className="pexels-catscoming-1907229-1" src={temporary} alt="Background" />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="section">
        <div className="container">
          <div className="title">© 2023 Fuji Ichybun Restaurant</div>
          <div className="title2">Privacy Policy</div>
          <div className="title3">Terms &amp; Conditions</div>
        </div>
      </div>
    </>
  );
}

export default FrontPage;