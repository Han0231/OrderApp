import {  sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../firebaseConfig';
import { toast } from 'react-toastify';

export const handleGoogleLogin = async (setIsLoading, navigate, setErrorMsg) => {
  try {
    setIsLoading(true);
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    setErrorMsg('');
    navigate('/login');
  } catch (error) {
    console.error('Google login error:', error);
    setErrorMsg('Google sign-in failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

export const handleForgotPassword = async (resetEmail, setShowForgotPassword) => {
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
  } catch (error) {
    console.error('Error sending password reset email:', error);
    toast.error('Failed to send password reset email. Please try again.', {
      position: "top-right",
      autoClose: 2000,
    });
  }
};

