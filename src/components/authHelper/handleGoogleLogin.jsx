import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const handleGoogleLogin = async (auth, provider, db, setIsLoading, setShowProfileCompletion, setFirstName, setLastName, setPhoneNumber, navigate, setErrorMsg) => {
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

export default handleGoogleLogin;