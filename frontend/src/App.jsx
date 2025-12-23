
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { TripProvider } from './context/TripContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import Budget from './pages/Budget';
import Crowd from './pages/Crowd';
import Safety from './pages/Safety';
import Sustainability from './pages/Sustainability';
import Reviews from './pages/Reviews';
import VirtualTour from './pages/VirtualTour';
import Chatbot from './pages/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <ErrorBoundary>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="plan" element={<Planner />} />
                <Route path="budget" element={<Budget />} />
                <Route path="crowd" element={<Crowd />} />
                <Route path="safety" element={<Safety />} />
                <Route path="sustainability" element={<Sustainability />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="virtual-tour" element={<VirtualTour />} />
                <Route path="chat" element={<Chatbot />} />
              </Route>
            </Routes>
          </Router>
        </ErrorBoundary>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
