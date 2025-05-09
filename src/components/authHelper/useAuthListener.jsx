import { useEffect } from 'react';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const useAuthListener = (
  setUser,
  setFirstName,
  setLastName,
  setPhoneNumber,
  setShowProfileCompletion,
  setOrders
) => {
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
  }, [setUser, setFirstName, setLastName, setPhoneNumber, setShowProfileCompletion, setOrders]);
};

export default useAuthListener;