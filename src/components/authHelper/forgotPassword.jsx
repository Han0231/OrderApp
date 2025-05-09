import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';

const handleForgotPassword = async (auth, resetEmail, setIsLoading, setShowForgotPassword) => {
  if (!resetEmail) {
    toast.error('Please enter an email to reset password.');
    return;
  }

  try {
    setIsLoading(true);
    await sendPasswordResetEmail(auth, resetEmail);
    toast.success('Password reset email sent. Please check your inbox.');
    setShowForgotPassword(false);
  } catch (error) {
    console.error('Password reset error:', error);
    toast.error('Failed to send reset email. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

export default handleForgotPassword;