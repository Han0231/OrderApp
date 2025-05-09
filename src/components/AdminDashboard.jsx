import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import './AdminDashboard.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: "", image: "" });
  const [newSectionName, setNewSectionName] = useState("");
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");

  const adminEmail = "zyuhang002@gmail.com";

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === adminEmail) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    const unsubscribeMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
      const menuData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        menuData.push({ id: doc.id, ...data });
      });

      setMenuItems(menuData);
      if (!selectedSection && menuData.length > 0) {
        setSelectedSection(menuData[0].id);
      }
    });

    const unsubscribeOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const ordersData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          ordersData.push({ id: doc.id, ...data });
        });
        setOrders(ordersData);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, [selectedSection]);

  const validateMenuItem = () => {
    if (!newMenuItem.name.trim()) {
      toast.error("Name is required.", { position: "top-right", autoClose: 2000 });
      return false;
    }
    if (!newMenuItem.price || isNaN(newMenuItem.price) || parseFloat(newMenuItem.price) <= 0) {
      toast.error("Price must be a valid positive number.", { position: "top-right", autoClose: 2000 });
      return false;
    }
    if (!newMenuItem.image.trim()) {
      toast.error("Image URL is required.", { position: "top-right", autoClose: 2000 });
      return false;
    }
    return true;
  };

  const handleAddMenuItem = async () => {
    if (!validateMenuItem()) {
      return;
    }

    try {
      const sectionDoc = menuItems.find((item) => item.id === selectedSection);
      if (!sectionDoc) {
        toast.error("Section does not exist.", { position: "top-right", autoClose: 2000 });
        return;
      }

      const updatedItems = [
        ...sectionDoc.items,
        {
          name: newMenuItem.name,
          price: parseFloat(newMenuItem.price),
          image: newMenuItem.image || "data:image/jpeg;base64,/path/to/default-image",
        },
      ];

      const sectionRef = doc(db, "menu", selectedSection);
      await updateDoc(sectionRef, { items: updatedItems });

      toast.success("Menu item added successfully!", { position: "top-right", autoClose: 2000 });
      setNewMenuItem({ name: "", price: "", image: "" });
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("Failed to add menu item. Please try again.", { position: "top-right", autoClose: 2000 });
    }
  };

  const handleRemoveMenuItem = async (index) => {
    if (!window.confirm("Are you sure you want to remove this menu item?")) {
      return;
    }

    try {
      const sectionDoc = menuItems.find((item) => item.id === selectedSection);
      if (!sectionDoc) {
        toast.error("Section does not exist.", { position: "top-right", autoClose: 2000 });
        return;
      }

      const updatedItems = sectionDoc.items.filter((_, i) => i !== index);

      const sectionRef = doc(db, "menu", selectedSection);
      await updateDoc(sectionRef, { items: updatedItems });

      toast.success("Menu item removed successfully!", { position: "top-right", autoClose: 2000 });
    } catch (error) {
      console.error("Error removing menu item:", error);
      toast.error("Failed to remove menu item. Please try again.", { position: "top-right", autoClose: 2000 });
    }
  };

  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      toast.error("Section name is required.", { position: "top-right", autoClose: 2000 });
      return;
    }

    try {
      const newSection = { category: newSectionName, items: [] };
      const sectionRef = doc(collection(db, "menu"));
      await setDoc(sectionRef, newSection);

      toast.success("New section added successfully!", { position: "top-right", autoClose: 2000 });
      setNewSectionName("");
    } catch (error) {
      console.error("Error adding new section:", error);
      toast.error("Failed to add new section. Please try again.", { position: "top-right", autoClose: 2000 });
    }
  };

  const handleRemoveSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section? This will remove all its menu items.")) {
      return;
    }

    try {
      const sectionRef = doc(db, "menu", sectionId);
      await deleteDoc(sectionRef);

      toast.success("Section removed successfully!", { position: "top-right", autoClose: 2000 });
      if (selectedSection === sectionId) {
        setSelectedSection(null);
      }
    } catch (error) {
      console.error("Error removing section:", error);
      toast.error("Failed to remove section. Please try again.", { position: "top-right", autoClose: 2000 });
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      toast.success(`Order status updated to ${newStatus}!`, { position: "top-right", autoClose: 2000 });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status. Please try again.", { position: "top-right", autoClose: 2000 });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!", { position: "top-right", autoClose: 2000 });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.", { position: "top-right", autoClose: 2000 });
    }
  };

  if (!user) {
    return <p>You do not have access to this page.</p>;
  }

  return (
    <div className="admin-dashboard">
      <ToastContainer />
      <h1>Admin Dashboard</h1>

      {/* Top Menu */}
      <div className="top-menu">
        <button className={activeTab === "menu" ? "active-tab" : ""} onClick={() => setActiveTab("menu")}>
          Manage Menu
        </button>
        <button className={activeTab === "orders" ? "active-tab" : ""} onClick={() => setActiveTab("orders")}>
          Manage Orders
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {activeTab === "menu" && (
          <section>
            <h2>Manage Menu</h2>
            <div className="add-section-form">
              <input
                type="text"
                placeholder="Enter New Section Name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
              <button onClick={handleAddSection}>Add Section</button>
            </div>

            <div className="add-menu-item-form">
              <input
                type="text"
                placeholder="Name"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Price"
                value={newMenuItem.price}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newMenuItem.image}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, image: e.target.value })}
              />
              <button onClick={handleAddMenuItem}>Add Menu Item</button>
            </div>

            <div className="section-dropdown">
              <label htmlFor="section-select">Select Section:</label>
              <select
                id="section-select"
                value={selectedSection || ""}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.category}
                  </option>
                ))}
              </select>
              {selectedSection && (
                <button className="remove-section-button" onClick={() => handleRemoveSection(selectedSection)}>
                  Remove Section
                </button>
              )}
            </div>

            {selectedSection && (
              <div className="menu-category">
                <h3>{menuItems.find((item) => item.id === selectedSection)?.category}</h3>
                <div className="menu-items-grid">
                  {menuItems
                    .find((item) => item.id === selectedSection)
                    ?.items.map((food, index) => (
                      <div key={index} className="menu-item-card">
                        <img
                          src={food.image || "data:image/jpeg;base64,/path/to/default-image"}
                          alt={food.name}
                          className="menu-item-image"
                        />
                        <p className="menu-item-name">{food.name}</p>
                        <p className = "menu-item-price">${food.price.toFixed(2)}</p>
                        <button className="remove-button" onClick={() => handleRemoveMenuItem(index)}>
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "orders" && (
          <section>
            <h2>Manage Orders</h2>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customerName || "N/A"}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>{order.createdAt?.toDate().toLocaleString() || "N/A"}</td>
                    <td>{order.status}</td>
                    <td>
                      <button
                        className="complete-button"
                        onClick={() => handleUpdateOrderStatus(order.id, "Complete")}
                        disabled={order.status === "Complete"}
                      >
                        Complete
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                        disabled={order.status === "Cancelled"}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>

      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

export default AdminDashboard;