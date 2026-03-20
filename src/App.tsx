import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateRequest from './pages/CreateRequest';
import History from './pages/History';
import AdminSettings from './pages/AdminSettings';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Navbar from './components/Navbar';
import InstallPWA from './components/InstallPWA';

function AppContent({ session, profile, isAdmin, fetchProfile }: any) {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
      {!isAuthPage && <Navbar profile={profile} isAdmin={isAdmin} />}
      <InstallPWA />
      <main className={`${!isAuthPage ? 'container mx-auto px-4 py-12 max-w-7xl' : ''}`}>
        <Routes>
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to="/" />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/" element={
            session ? (
              isAdmin ? <AdminDashboard /> : <UserDashboard profile={profile} />
            ) : <Navigate to="/login" />
          } />
          
          <Route path="/create-request" element={
            session ? <CreateRequest profile={profile} /> : <Navigate to="/login" />
          } />
          
          <Route path="/history" element={
            session ? <History /> : <Navigate to="/login" />
          } />
          
          <Route path="/admin/settings" element={
            session && isAdmin ? <AdminSettings /> : <Navigate to="/" />
          } />
          
          <Route path="/profile" element={
            session ? <Profile profile={profile} refreshProfile={() => fetchProfile(session.user.id, session.user.email)} /> : <Navigate to="/login" />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App component mounted");
    // Fallback timeout to prevent infinite loading
    const timer = setTimeout(() => {
      console.log("Loading fallback triggered");
      setLoading(false);
    }, 5000);

    const initAuth = async () => {
      console.log("Initializing auth...");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Get session error:", error);
        }
        console.log("Session fetched:", session?.user?.id);
        setSession(session);
        if (session) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        // Bootstrap admin for the owner email
        if (userEmail === 'asharzainurie@gmail.com' && data.role !== 'admin') {
          const { data: updatedData } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId)
            .select()
            .single();
          if (updatedData) setProfile(updatedData);
        } else {
          setProfile(data);
        }
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === 'admin' || session?.user?.email === 'asharzainurie@gmail.com';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-emerald-500/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent 
        session={session} 
        profile={profile} 
        isAdmin={isAdmin} 
        fetchProfile={fetchProfile} 
      />
    </Router>
  );
}
