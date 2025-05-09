import { signOut } from 'firebase/auth';

const handleLogout = async (auth, setUser, navigate, setErrorMsg) => {
  try {
    await signOut(auth); // Sign out the user
    setUser(null); // Clear the user state
    navigate('/login'); // Redirect to the login page
  } catch (error) {
    console.error('Error logging out:', error);
    setErrorMsg('Failed to log out. Please try again.');
  }
};

export default handleLogout;