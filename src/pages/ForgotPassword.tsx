import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Instruksi pemulihan kata sandi telah dikirim ke email Anda.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 relative z-10"
      >
        <Link 
          to="/login" 
          className="inline-flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Kembali ke Login</span>
        </Link>

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <Mail size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Lupa Kata Sandi?</h1>
          <p className="text-zinc-500 mt-3 font-medium">Masukkan email Anda untuk menerima tautan pemulihan.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center space-x-3"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        {message && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center space-x-3"
          >
            <CheckCircle size={18} />
            <span>{message}</span>
          </motion.div>
        )}

        <form onSubmit={handleResetRequest} className="space-y-6">
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg shadow-xl shadow-emerald-900/20 group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
            ) : (
              <>
                <span className="uppercase tracking-[0.2em] font-black">Kirim Tautan</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
