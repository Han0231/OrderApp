
import { signInWithEmailAndPassword } from 'firebase/auth';

const handleLogin = async (e, auth, email, password, setIsLoading, setErrorMsg, navigate, adminEmail) => {
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

export default handleLogin;