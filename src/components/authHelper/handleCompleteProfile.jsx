import { doc, setDoc } from 'firebase/firestore';

const handleCompleteProfile = async (
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
) => {
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

export default handleCompleteProfile;