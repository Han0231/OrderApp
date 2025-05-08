import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import shoppingCart from "./imageFiles/Shopping_Cart_Icon.png";
import profilecon from "./imageFiles/profilecon.png";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase auth
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the user state when the auth state changes
    });

    return () => unsubscribe(); // Cleanup the listener
  }, [auth]);

  return (
    <div className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        KADU KITCHEN
      </Link>

      {/* Navigation Buttons */}
      <div className="navbar-buttons">
        <Link to="/">
          <button className="home">Home</button>
        </Link>
        <Link to="/menu">
          <button className="menu">Menu</button>
        </Link>
        <Link to="/contact">
          <button className="contact-locations">Contact & Locations</button>
        </Link>
        <Link to="/about">
          <button className="about-us">About Us</button>
        </Link>
      </div>

      {/* Login/Profile and Cart */}
      <div className="navbar-right">
        {user ? (
          // If user is logged in, show Profile button
          <Link to="/login">
            <img className="profile-button" src={profilecon} alt="Profile" />
          </Link>
        ) : (
          // If user is not logged in, show Login button
          <Link to="/login">
            <button className="login-button">Login</button>
          </Link>
        )}
        <Link to="/cart">
          <button className="shopping-cart-button">
            <img src={shoppingCart} alt="Cart" />
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;