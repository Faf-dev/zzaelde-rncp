import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './composants/Header/Header';
import Home from './pages/Accueil';
import DetailPlaylist from './pages/DetailPlaylist';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import 'aos/dist/aos.css';
import AOS from 'aos';

/** Route protégée : redirige vers /login si non authentifié */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

/** Routes publiques avec Header */
function PublicLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:playlistId" element={<DetailPlaylist />} />
      </Routes>
    </>
  );
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: 'ease-in-out',
      once: true,
      disable: false,
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Pages publiques */}
          <Route path="/*" element={<PublicLayout />} />

          {/* Connexion admin */}
          <Route path="/login" element={<Login />} />

          {/* Panneau d'administration (protégé) */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
