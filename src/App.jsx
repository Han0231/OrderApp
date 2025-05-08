// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FrontPage from './components/frontPage';
import Menu from './components/menuPage';
import Login from './components/Login';
import Cart from './components/Cart'; 
import { CartProvider } from './components/CartContext'; 
import SignUp from './components/Signup'; 
import Contact from './components/Contact'; // Import the Contact component
import About from './components/aboutUs'; // Import the About component
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  return (

    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/contact" element={<Contact />} /> {/* Add the Contact route */}
          <Route path="/about" element={<About />} /> {/* Add the About route */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </CartProvider>

  );
}

export default App;
