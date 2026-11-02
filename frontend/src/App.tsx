import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';
import { HomePage } from './features/places/HomePage';
import { ExplorePage } from './features/places/ExplorePage';
import { PlaceDetailPage } from './features/places/PlaceDetailPage';
import { VisitPage } from './features/visit/VisitPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ProfilePage } from './features/auth/ProfilePage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isVisitRoute = location.pathname.startsWith('/visit/');

  return (
    <div className="min-h-screen flex flex-col bg-void text-ink-main selection:bg-royal-600 selection:text-ink-main">
      {!isVisitRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/place/:slug" element={<PlaceDetailPage />} />
          <Route path="/visit/:slug" element={<VisitPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      {!isVisitRoute && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;
