import React, { useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, provider, db } from '../firebaseConfig';
import userIcon from "./imageFiles/userIcon.svg";
import lockIcon from "./imageFiles/lock.svg";
import google from "./imageFiles/google.png";
import './Login.css';
import Navbar from './Navbar';
import {ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthListener from './authHelper/useAuthListener';
import handleLogin from './authHelper/handleLogin';
import handleGoogleLogin from './authHelper/handleGoogleLogin';
import handleLogout from './authHelper/handleLogout';
import handleCompleteProfile from './authHelper/handleCompleteProfile';
import handleVerification from './authHelper/handleVerification';
import handleForgotPassword from './authHelper/forgotPassword';
import profileTab from './authHelper/ProfilePage';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('accountInfo');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orders, setOrders] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  const adminEmail = "zyuhang002@gmail.com";

useAuthListener(setUser, setFirstName, setLastName, setPhoneNumber, setShowProfileCompletion, setOrders);

const handleLoginFunction = (e) => {
  handleLogin(e, auth, email, password, setIsLoading, setErrorMsg, navigate, adminEmail);
};

const handleGoogleLoginFunction = () => {
  handleGoogleLogin(
    auth,
    provider,
    db,
    setIsLoading,
    setShowProfileCompletion,
    setFirstName,
    setLastName,
    setPhoneNumber,
    navigate,
    setErrorMsg
  );
};

const handleLogoutFunction = () => {
  handleLogout(auth, setUser, navigate, setErrorMsg);
};

const CompleteProfile = (e) => {
  handleCompleteProfile(
    e,
    user,
    db,
    firstName,
    lastName,
    phoneNumber,
    setIsLoading,
    setShowProfileCompletion,
    navigate,
    setErrorMsg
  );
};

const Verification = async () => {
  await handleVerification(user, setIsLoading);
};


const forgotPassword = async () => {
  await handleForgotPassword(auth, resetEmail, setIsLoading, setShowForgotPassword);
};

const LoadprofileTab = () => {
  return profileTab(
    activeTab,
    firstName,
    lastName,
    phoneNumber,
    user,
    orders,
    expandedSection,
    setExpandedSection,
    navigate,
    Verification,
    isLoading
  );
};
  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="login-page">
        {showProfileCompletion ? (
          <div className="profile-completion">
            <h2>Complete Your Profile</h2>
            <form onSubmit={CompleteProfile} className="complete-profile-form">
              <div className="input-group">
                <label htmlFor="firstName" className="label">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  className="input-field"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="lastName" className="label">Last Name:</label>
                <input
                  type="text"
                  id="lastName"
                  className="input-field"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="phoneNumber" className="label">Phone Number:</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="input-field"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="button2" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        ) : user ? (
          <div className="profile">
            <div className="side-tabs">
              <button
                onClick={() => setActiveTab('accountInfo')}
                className={activeTab === 'accountInfo' ? 'active' : ''}
              >
                Account Information
              </button>
              <button
                onClick={() => setActiveTab('orderHistory')}
                className={activeTab === 'orderHistory' ? 'active' : ''}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={activeTab === 'payment' ? 'active' : ''}
              >
                Payment
              </button>
              <button
                onClick={() => setActiveTab('verification')}
                className={activeTab === 'verification' ? 'active' : ''}
              >
                Verification
              </button>
              <button
                onClick={handleLogoutFunction}
                className="logout"
              >
                Logout
              </button>
            </div>
            <div className="tab-content">{LoadprofileTab()}</div>
          </div>
        ) : (
          <div className="login-container">
            <h2 className="login-title">Login</h2>
            <form onSubmit={handleLoginFunction} className="login-form">
              <div className="input-group">
                <img src={userIcon} alt="User Icon" className="icon" />
                <label htmlFor="email" className="label">Email:</label>
                <input
                  type="email"
                  id="email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <img src={lockIcon} alt="Lock Icon" className="icon" />
                <label htmlFor="password" className="label">Password:</label>
                <input
                  type="password"
                  id="password"
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="button2" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            {errorMsg && <p className="error-message">{errorMsg}</p>}
            <div className="forgot-password">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="link-button transparent-button"
              >
                Forgot password?
              </button>
            </div>
            {showForgotPassword && (
              <div className="forgot-password-popup">
                <h3>Reset Password</h3>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="input-field"
                />
                <button onClick={forgotPassword} className="button2">
                  Send Reset Email
                </button>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="link-button"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="not-a-member">
              Not a Member? 
              <Link to="/signup"> Sign Up Now</Link>
            </div>
            <div className="social-login">
              <p>Or Sign Up Using</p>
              <div className="social-icons">
                <img
                  src={google}
                  alt="Google Icon"
                  onClick={handleGoogleLoginFunction}
                  style={{ cursor: 'pointer' }}
                />

              </div>
            </div>
            <footer className="footer">
              <p>© 2023 KADU Kitchen Restaurant</p>
              <p><Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms & Conditions</Link></p>
            </footer>
          </div>
        )}
      </div>
    </>
  );
}

export default Login;