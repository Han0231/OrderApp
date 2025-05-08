import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebaseConfig';
import userIcon from "./imageFiles/userIcon.svg";
import lockIcon from "./imageFiles/lock.svg";
import facebook from "./imageFiles/facebook.png";
import google from "./imageFiles/google.png";
import './Login.css';
import Navbar from './Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const adminEmail = "zyuhang002@gmail.com";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.email === adminEmail) {
        navigate('/admin');
      } else if (user.emailVerified) {
        setErrorMsg('');
        navigate('/menu');
      } else {
        setErrorMsg('Please verify your email before accessing the menu.');
        navigate('/login');
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          setErrorMsg('No user found with this email.');
          break;
        case 'auth/wrong-password':
          setErrorMsg('Incorrect password.');
          break;
        case 'auth/invalid-email':
          setErrorMsg('Invalid email format.');
          break;
        default:
          setErrorMsg(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setErrorMsg('');
      navigate('/menu');
    } catch (error) {
      console.error('Google login error:', error);
      setErrorMsg('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email to reset your password.', {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent! Check your inbox.', {
        position: "top-right",
        autoClose: 2000,
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error('Failed to send password reset email. Please try again.', {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleResendVerification = async () => {
    try {
      if (user) {
        await sendEmailVerification(user);
        toast.success('Verification email sent! Check your inbox.', {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.', {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'accountInfo':
        return (
          <div>
            <h3>Account Information</h3>
            <p>Email: {user?.email || 'N/A'}</p>
          </div>
        );
      case 'orderHistory':
        return (
          <div>
            <h3>Order History</h3>
            <p>Click on an order to view details.</p>
            <ul>
              <li>Order #12345 - $50.00</li>
              <li>Order #67890 - $30.00</li>
            </ul>
          </div>
        );
      case 'payment':
        return (
          <div>
            <h3>Payment</h3>
            <p>Payment methods will be displayed here.</p>
          </div>
        );
      case 'verification':
        return (
          <div>
            <h3>Email Verification</h3>
            {user ? (
              user.emailVerified ? (
                <p>Your email is verified. Thank you!</p>
              ) : (
                <>
                  <p>Your email is not verified. Please verify your email to access all features.</p>
                  <button
                    onClick={handleResendVerification}
                    className="button2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </>
              )
            ) : (
              <p>Loading user information...</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="login-page">
        {user ? (
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
                onClick={handleLogout}
                className="logout"
              >
                Logout
              </button>
            </div>
            <div className="tab-content">{renderTabContent()}</div>
          </div>
        ) : (
          <div className="login-container">
            <h2 className="login-title">Login</h2>
            <form onSubmit={handleLogin} className="login-form">
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
                <button onClick={handleForgotPassword} className="button2">
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
                  onClick={handleGoogleLogin}
                  style={{ cursor: 'pointer' }}
                />
                <img src={facebook} alt="Facebook Icon" />
              </div>
            </div>
            <footer className="footer">
              <p>© 2023 Fuji Ichybun Restaurant</p>
              <p><Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms & Conditions</Link></p>
            </footer>
          </div>
        )}
      </div>
    </>
  );
}

export default Login;