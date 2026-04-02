import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, User, LayoutDashboard, FileText, History, Settings } from 'lucide-react';

export default function Navbar({ profile, isAdmin }: { profile: any, isAdmin: boolean }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_8px_16px_rgba(16,185,129,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform border border-emerald-400/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.4),transparent_70%)]"></div>
              <span className="text-2xl font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] relative z-10">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-white leading-none">PAK TO</span>
              <span className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] uppercase mt-1">Kecamatan Tulis</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-2xl border border-white/5">
            {isAdmin ? (
              <>
                <Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-2">
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin/settings" className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-2">
                  <Settings size={16} />
                  <span>Pengaturan</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-2">
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/create-request" className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-2">
                  <FileText size={16} />
                  <span>Buat Surat</span>
                </Link>
                <Link to="/history" className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-2">
                  <History size={16} />
                  <span>Riwayat</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <Link 
              to="/profile"
              className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <User size={16} />
              </div>
              <span className="text-sm font-semibold text-zinc-200">{profile?.full_name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
