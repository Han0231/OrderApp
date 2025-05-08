import React, { createContext, useState, useEffect } from "react";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS
import { Link } from "react-router-dom"; // Import Link from react-router-dom

// Create a context so other components can access cart data
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize Firestore and Firebase Authentication
  const db = getFirestore();
  const auth = getAuth();

  // Store the logged-in user and cart items
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  /**
   * Track user login/logout using Firebase Auth
   * This allows us to fetch and store cart data based on the user
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the current user in state
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  /**
   * When a user logs in, fetch their cart from Firestore
   * If user logs out, clear the cart
   */
  useEffect(() => {
    if (!user) {
      setCartItems([]); // Clear cart when logged out
      return;
    }

    // Reference to the user's cart document in Firestore
    const cartRef = doc(db, "carts", user.uid);

    // Listen to real-time updates to user's cart
    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCartItems(data.items || []); // Set cart from Firestore
      } else {
        setCartItems([]); // No cart found, use empty cart
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [user]);

  /**
   * Save updated cart to Firestore for the logged-in user
   */
  const updateCartInFirestore = async (items) => {
    if (!user) return; // Do nothing if not logged in
    const cartRef = doc(db, "carts", user.uid);
    await setDoc(cartRef, { items }, { merge: true }); // Merge to preserve other fields if needed
  };

  /**
   * Add item to cart or increase quantity if it already exists
   * Quantity is increased by 1
   */
  const addToCart = (item) => {
    if (!user) {
      toast.error("Please log in to proceed with your order", {
        position: "top-center",
        autoClose: 2200,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    toast.success(`${item.name} added to cart!`, {
      position: "top-right",
      autoClose: 800,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.name === item.name);

      let updated;
      if (existingItem) {
        updated = prevItems.map((cartItem) =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        updated = [...prevItems, { ...item, quantity: 1 }];
      }

      updateCartInFirestore(updated);
      return updated;
    });
  };

  /**
   * Increase quantity of a specific item by 1
   */
  const increaseQuantity = (name) => {
    setCartItems((prevItems) => {
      const updated = prevItems.map((item) =>
        item.name === name ? { ...item, quantity: item.quantity + 1 } : item
      );
      updateCartInFirestore(updated);
      return updated;
    });
  };

  /**
   * Decrease quantity of a specific item by 1
   * If quantity becomes 0 or less, the item is removed
   */
  const decreaseQuantity = (name) => {
    setCartItems((prevItems) => {
      const updated = prevItems
        .map((item) =>
          item.name === name
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0); // Filter out items with 0 quantity

      updateCartInFirestore(updated);
      return updated;
    });
  };

  /**
   * Remove item from cart completely
   */
  const removeFromCart = (name) => {
    setCartItems((prevItems) => {
      const updated = prevItems.filter((item) => item.name !== name);
      updateCartInFirestore(updated);
      return updated;
    });
  };

  /**
   * Clear the cart completely
   */
  const clearCart = () => {
    setCartItems([]); // Reset local cart state
    if (user) {
      const cartRef = doc(db, "carts", user.uid);
      setDoc(cartRef, { items: [] }, { merge: true }); // Clear cart in Firestore
    }
  };

  // Provide cart data and functions to any component using this context
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        increaseQuantity,
        clearCart, // Provide clearCart function
      }}
    >
      {children}
    </CartContext.Provider>
  );
};