import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FarmerRegister from './pages/FarmerRegister';
import FarmerLogin from './pages/FarmerLogin';
import FarmerDashboard from './pages/FarmerDashboard';
import BookFertilizer from './pages/BookFertilizer';
import OfficerLogin from './pages/OfficerLogin';
import OfficerPortal from './pages/OfficerPortal';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home - Animated Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Farmer Routes */}
        <Route path="/farmer/login" element={<FarmerLogin />} />
        <Route path="/farmer/register" element={<FarmerRegister />} />
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/book" element={<BookFertilizer />} />

        {/* Officer Routes - Login required first */}
        <Route path="/officer/login" element={<OfficerLogin />} />
        <Route path="/officer/verify" element={<OfficerPortal />} />

        {/* Admin Panel - All management inside */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Legacy redirects */}
        <Route path="/admin/dashboard" element={<AdminPanel />} />
        <Route path="/officer/portal" element={<OfficerPortal />} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌾</div>
            <h1 style={{ fontSize: '32px', margin: '0 0 8px' }}>404 – Page Not Found</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>This route doesn't exist in the system.</p>
            <a href="/" style={{ color: '#4ade80', fontWeight: '700', textDecoration: 'none' }}>← Go to Home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;