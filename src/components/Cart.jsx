import React, { useContext } from "react";
import { CartContext } from "./CartContext";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";

// 🆕 Firebase Firestore import
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    decreaseQuantity,
    increaseQuantity
  } = useContext(CartContext);

  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.price ? item.price * item.quantity : 0),
    0
  );

  const handleIncrease = (name) => {
    increaseQuantity(name);
    toast.success("Increased quantity", { autoClose: 800 });
  };

  const handleDecrease = (name, quantity) => {
    if (quantity > 1) {
      decreaseQuantity(name);
      toast.info("Decreased quantity", { autoClose: 800 });
    }
  };

  const handleRemove = (name) => {
    removeFromCart(name);
    toast.error(`${name} removed from cart`, { autoClose: 1000 });
  };

  // Inside the Cart component:
const handleCheckout = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user || !user.email) {
    toast.error("You must be signed in to place an order.");
    return;
  }

  if (cartItems.length === 0) {
    toast.warning("Your cart is empty!");
    return;
  }

  const confirm = window.confirm("Are you sure you want to place the order?");
  if (!confirm) return;

  const orderData = {
    customerName: user.displayName || "Customer",
    email: user.email,
    items: cartItems.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    total: totalPrice,
    status: "pending",
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, "orders"), orderData);
    console.log("Order ID:", docRef.id);
    toast.success(`Order submitted! Receipt will be sent to ${user.email}`);
  } catch (error) {
    console.error("Order submission error:", error);
    toast.error("Failed to place order.");
  }
};

  return (
    <div className="cart-container">
      <Navbar />
      <ToastContainer />
      <div className="cart-header">
        <h1>Your Cart</h1>
      </div>
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">Empty cart! GO BUY SOMETHING 😡</p>
      ) : (
        <div className="cart-content">
          <div className="cart-table">
            <div className="cart-table-header">
              <span>Item</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>
            {cartItems.map((item, index) => (
              <div key={index} className="cart-table-row">
                <div className="cart-item-info">
                  <img src={item.image} alt={item.name} className="cart-image" />
                  <div>
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-category">{item.category}</span>
                  </div>
                </div>
                <span>${Number(item.price).toFixed(2)}</span>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleDecrease(item.name, item.quantity)}
                    className="qty-btn"
                    disabled={item.quantity === 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncrease(item.name)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
                <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item.name)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="special-instructions">
              <label htmlFor="instructions">Special Instructions</label>
              <textarea id="instructions" placeholder="Add any special instructions here..." />
            </div>
            <div className="cart-summary">
              <div className="cart-total">
                <strong>${totalPrice.toFixed(2)}</strong>
              </div>
              {/* 🆕 Checkout button connected */}
              <button className="checkout-btn" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
