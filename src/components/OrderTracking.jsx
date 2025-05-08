import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./OrderTracking.css";

function OrderTracking() {
  const [progress, setProgress] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null); // State to store order details
  const navigate = useNavigate();
  const { orderId } = useParams();
  const statusUpdated = useRef(false); // Track if the status has been updated

  useEffect(() => {
    const fetchOrderStartTime = async () => {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const orderData = orderSnap.data();

        // Set order details
        setOrderDetails(orderData);

        // Check if the order has a start time; if not, set it
        if (!orderData.startTime) {
          await updateDoc(orderRef, { startTime: serverTimestamp() });
        }
      }
    };

    fetchOrderStartTime();
  }, [orderId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const orderData = orderSnap.data();

        // Calculate progress based on elapsed time
        if (orderData.startTime) {
          const startTime = orderData.startTime.toDate();
          const now = new Date();
          const elapsedSeconds = (now - startTime) / 1000; // Elapsed time in seconds
          const totalSeconds = 5 * 60; // 5 minutes in seconds
          const calculatedProgress = Math.min((elapsedSeconds / totalSeconds) * 100, 100);

          setProgress(calculatedProgress);

          // If progress reaches 100% and status hasn't been updated, update the status
          if (calculatedProgress >= 100 && !statusUpdated.current) {
            await updateDoc(orderRef, { status: "Complete" });
            statusUpdated.current = true; // Mark status as updated
          }
        }
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [orderId]);

  return (
    <div className="order-tracking-container">
      <h2>Order Tracking</h2>
      <p>Order ID: {orderId}</p>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p>
        {progress < 100
          ? "Preparing your order... Please wait."
          : "Order is ready! You can pick it up now."}
      </p>

      {/* Animated Waiting Dots */}
      {progress < 100 && (
        <div className="waiting-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      )}

      {/* Order Details */}
      {orderDetails && (
        <div className="order-details">
          <h3>Order Details</h3>
          <p>
            <strong>Status:</strong> {orderDetails.status || "Pending"}
          </p>
          <p>
            <strong>Total:</strong> ${orderDetails.total?.toFixed(2)}
          </p>
          <p>
            <strong>Special Instructions:</strong>{" "}
            {orderDetails.specialInstructions || "None"}
          </p>
          <h4>Items:</h4>
          <ul>
            {orderDetails.items?.map((item, index) => (
              <li key={index}>
                {item.quantity}x {item.name} - ${item.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="tracker-message">
        If you want to see the tracker again, please check the order history in your profile.
      </p>
      <div className="button-container">
        <button onClick={() => navigate("/menu")} className="back-to-menu-btn">
          Back to Menu
        </button>
      </div>
    </div>
  );
}

export default OrderTracking;