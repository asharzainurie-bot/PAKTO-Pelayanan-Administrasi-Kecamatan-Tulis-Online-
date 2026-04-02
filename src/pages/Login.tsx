import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-32 h-32 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(16,185,129,0.2)] border-2 border-emerald-500/20 relative overflow-hidden group hover:scale-105 transition-transform duration-500">
            <img 
              src="https://i.imgur.com/6buHyBO.png" 
              alt="PAKTO Logo" 
              className="w-full h-full object-contain relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">PAK TO</h1>
          <p className="text-emerald-500 font-bold tracking-[0.2em] uppercase text-xs mb-4">Pelayanan Administrasi Kecamatan Tulis Online</p>
          <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full opacity-50"></div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <LogIn size={14} className="rotate-180" />
            </div>
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="email"
                required
                className="glass-input w-full pl-12 pr-4 py-4"
                placeholder="email@anda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 ml-1">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Password</label>
              <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">
                Lupa Password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="password"
                required
                className="glass-input w-full pl-12 pr-4 py-4"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg shadow-xl shadow-emerald-900/20 group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
            ) : (
              <>
                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                <span className="uppercase tracking-[0.2em] font-black">Masuk</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-zinc-500 text-sm font-medium">
          Belum punya akun?{' '}
          <Link to="/register" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">
            Daftar Sekarang
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
