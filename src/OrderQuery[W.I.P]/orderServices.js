import { db, serverTimestamp } from "../firebaseConfig";
import { collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";

// Create a new order with timestamp
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: serverTimestamp(),
      status: "pending"
    });
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Get all orders sorted by creation date (newest first)
export const getOrdersSortedByDate = async () => {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};