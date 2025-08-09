import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExtractCheck from './pages/ExtractCheck';
import ViewCheck from './pages/ViewCheck';
import Profile from './pages/Profile';
import PostForm from './pages/PostForm';
import PostDetail from './pages/PostDetail';
import TestExtraction from './pages/TestExtraction';
import CheckDetails from './pages/CheckDetails';
import InsertExtractedData from './pages/InsertExtractedData';

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={logout} />
        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/dashboard" /> : <Register onLogin={login} />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/extract" 
              element={user ? <ExtractCheck /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/check/:id" 
              element={user ? <ViewCheck /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/posts/new" 
              element={user ? <PostForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/posts/:id/edit" 
              element={user ? <PostForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/posts/:id" 
              element={user ? <PostDetail /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/test-extraction" 
              element={user ? <TestExtraction /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/check-details" 
              element={user ? <CheckDetails /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/insert-data/:id" 
              element={user ? <InsertExtractedData /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App; 