import { sendEmailVerification } from 'firebase/auth';
import { toast } from 'react-toastify';

const handleVerification = async (user, setIsLoading) => {
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

export default handleVerification;