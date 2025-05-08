import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, provider, db } from '../firebaseConfig';
import userIcon from "./imageFiles/userIcon.svg";
import lockIcon from "./imageFiles/lock.svg";

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
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orders, setOrders] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  const adminEmail = "zyuhang002@gmail.com";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setPhoneNumber(userData.phoneNumber || '');
        } else {
          // If user data is missing, show profile completion form
          setShowProfileCompletion(true);
        }

        // Set up a real-time listener for the user's order history
        try {
          const ordersRef = collection(db, 'orders');
          const q = query(ordersRef, where('email', '==', user.email), orderBy('createdAt', 'desc'));

          const unsubscribeOrders = onSnapshot(q, (querySnapshot) => {
            const fetchedOrders = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setOrders(fetchedOrders);
          });

          // Cleanup the listener when the component unmounts
          return () => unsubscribeOrders();
        } catch (error) {
          console.error('Error setting up real-time listener for orders:', error);
        }
      } else {
        setUser(null);
        setOrders([]); // Clear orders when user logs out
      }
    });

    // Cleanup the auth listener when the component unmounts
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

      // Check if the user already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If the user is new, save their basic info to Firestore
        await setDoc(userDocRef, {
          firstName: user.displayName ? user.displayName.split(' ')[0] : '',
          lastName: user.displayName ? user.displayName.split(' ')[1] || '' : '',
          email: user.email,
          phoneNumber: '', // Leave phone number blank for now
        });

        // Show profile completion form
        setShowProfileCompletion(true);
      } else {
        // If the user already exists, fetch their data
        const userData = userDoc.data();
        setFirstName(userData.firstName || '');
        setLastName(userData.lastName || '');
        setPhoneNumber(userData.phoneNumber || '');
        navigate('/menu');
      }

      setErrorMsg('');
    } catch (error) {
      console.error('Google login error:', error);
      setErrorMsg('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      setUser(null); // Clear the user state
      navigate('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Error logging out:', error);
      setErrorMsg('Failed to log out. Please try again.');
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userDocRef = doc(db, 'users', user.uid);

      // Save the completed profile data to Firestore
      await setDoc(
        userDocRef,
        {
          firstName,
          lastName,
          phoneNumber,
          email: user.email,
        },
        { merge: true } // Merge to avoid overwriting existing data
      );

      setShowProfileCompletion(false);
      navigate('/menu'); // Redirect to the menu after completion
    } catch (error) {
      console.error('Error completing profile:', error);
      setErrorMsg('Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      if (user) {
        await sendEmailVerification(user); // Send verification email using Firebase
        toast.success('Verification email sent. Please check your inbox.');
      } else {
        toast.error('No user is logged in.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter an email to reset password.");
      return;
    }
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent. Please check your inbox.");
      setShowForgotPassword(false);
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const renderTabContent = () => {
    switch (activeTab) {
      case 'accountInfo':
        return (
          <div className="account-info">
            <h3>Account Information</h3>
            <div className="account-info-cards">
              <div className="info-card">
                <h4>First Name</h4>
                <p>{firstName || 'N/A'}</p>
              </div>
              <div className="info-card">
                <h4>Last Name</h4>
                <p>{lastName || 'N/A'}</p>
              </div>
              <div className="info-card">
                <h4>Phone Number</h4>
                <p>{phoneNumber || 'N/A'}</p>
              </div>
              <div className="info-card">
                <h4>Email</h4>
                <p>{user?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        );
      case 'orderHistory':
        return (
          <div>
            <h3>Order History</h3>
            {orders.length === 0 ? (
              <p>You have no past orders.</p>
            ) : (
              <div className="order-history">
                {orders.map((order, index) => (
                  <div key={order.id} className="order-card">
                    <div className="order-section">
                      <button
                        className="order-section-header"
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === `order-${index}-id` ? null : `order-${index}-id`
                          )
                        }
                      >
                        <p>
                          <strong>Order #:</strong> {order.id}
                        </p>
                        <p>
                          <strong>Date:</strong> {order.createdAt?.toDate().toLocaleString()}
                        </p>
                      </button>
                      {expandedSection === `order-${index}-id` && (
                        <div className="order-section-content">
                          <p>
                            <strong>Status:</strong> {order.status || "Pending"}
                          </p>
                          <p>
                            <strong>Total:</strong> ${order.total.toFixed(2)}
                          </p>
                          <p>
                            <strong>Special Instructions:</strong>{" "}
                            {order.specialInstructions || "None"}
                          </p>
                          <p>
                            <strong>Items:</strong>
                          </p>
                          <ul>
                            {order.items.map((item, idx) => (
                              <li key={idx}>
                                {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={() => navigate(`/order-tracking/${order.id}`)}
                            className="track-order-btn"
                            disabled={order.status === "Complete"}
                          >
                            {order.status === "Complete" ? "Order Completed" : "Track Order"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        {showProfileCompletion ? (
          <div className="profile-completion">
            <h2>Complete Your Profile</h2>
            <form onSubmit={handleCompleteProfile} className="complete-profile-form">
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