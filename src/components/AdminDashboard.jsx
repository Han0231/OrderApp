import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from "firebase/auth";
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import './AdminDashboard.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: "", image: "" });
  const [newSectionName, setNewSectionName] = useState("");
  const [users, setUsers] = useState([]);
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
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMenu();
    };
  }, []);

  const handleAddMenuItem = async (sectionId) => {
    try {
      const sectionDoc = menuItems.find((item) => item.id === sectionId);
      if (!sectionDoc) {
        toast.error("Section does not exist.", {
          position: "top-right",
          autoClose: 2000,
        });
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

      const sectionRef = doc(db, "menu", sectionId);
      await updateDoc(sectionRef, { items: updatedItems });

      toast.success("Menu item added successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      setNewMenuItem({ name: "", price: "", image: "" });
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("Failed to add menu item. Please try again.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleRemoveMenuItem = async (sectionId, itemIndex) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      const sectionDoc = menuItems.find((item) => item.id === sectionId);
      if (!sectionDoc) return;

      const updatedItems = sectionDoc.items.filter((_, index) => index !== itemIndex);

      const sectionRef = doc(db, "menu", sectionId);
      await updateDoc(sectionRef, { items: updatedItems });

      toast.success("Menu item removed successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error removing menu item:", error);
      toast.error("Failed to remove menu item. Please try again.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleAddSection = async () => {
    try {
      const newSection = {
        category: newSectionName,
        items: [],
      };
      const sectionRef = doc(collection(db, "menu"));
      await setDoc(sectionRef, newSection);

      toast.success("New section added successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      setNewSectionName("");
    } catch (error) {
      console.error("Error adding new section:", error);
      toast.error("Failed to add new section. Please try again.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleRemoveSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section? This will remove all its menu items.")) {
      return;
    }

    try {
      const sectionRef = doc(db, "menu", sectionId);
      await deleteDoc(sectionRef);

      toast.success("Section removed successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error removing section:", error);
      toast.error("Failed to remove section. Please try again.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.", {
        position: "top-right",
        autoClose: 2000,
      });
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
        <button
          className={activeTab === "menu" ? "active-tab" : ""}
          onClick={() => setActiveTab("menu")}
        >
          Manage Menu
        </button>
        <button
          className={activeTab === "users" ? "active-tab" : ""}
          onClick={() => setActiveTab("users")}
        >
          Manage Users
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {activeTab === "menu" && (
          <section>
            <h2>Manage Menu</h2>

            {/* Add New Section Form */}
            <div className="add-section-form">
              <input
                type="text"
                placeholder="Enter New Section Name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
              <button onClick={handleAddSection}>Add Section</button>
            </div>

            {/* Menu Items */}
            {menuItems.map((item) => (
              <div key={item.id} className="menu-category">
                <p className="category-title">
                  {item.category}
                  <button
                    className="remove-section-button"
                    onClick={() => handleRemoveSection(item.id)}
                  >
                    Remove Section
                  </button>
                </p>
                <div className="menu-items-grid">
                  {item.items.map((food, index) => (
                    <div key={index} className="menu-item-card">
                      <img
                        src={food.image || "data:image/jpeg;base64,/path/to/default-image"}
                        alt={food.name}
                        className="menu-item-image"
                      />
                      <p className="menu-item-name">{food.name}</p>
                      <button
                        className="remove-button"
                        onClick={() => handleRemoveMenuItem(item.id, index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Menu Item Form for Each Section */}
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
                  <button onClick={() => handleAddMenuItem(item.id)}>Add Menu Item</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "users" && (
          <section>
            <h2>Manage Users</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td>{user.email}</td>
                    <td>{user.verified ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className="reset-button"
                        onClick={() => handleResetPassword(user.email)}
                      >
                        Reset Password
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