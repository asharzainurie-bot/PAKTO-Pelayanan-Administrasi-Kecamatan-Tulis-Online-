import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, MapPin, Phone, Building } from 'lucide-react';

const VILLAGES = [
  'Beji', 'Cluwuk', 'Jolosekti', 'Jrakahpayung', 'Kaliboyo', 'Kebumen', 
  'Kedungsegog', 'Kenconorejo', 'Manggis', 'Ponowareng', 'Posong', 
  'Sembojo', 'Siberuk', 'Simbangjati', 'Simbangdesa', 'Tulis', 'Wringingintung'
];

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    address: '',
    phone: '',
    village: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Upsert profile with additional info
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: formData.full_name,
            address: formData.address,
            phone: formData.phone,
            village: formData.village,
            role: 'user'
          });
        
        if (upsertError) {
          console.error('Profile upsert error:', upsertError);
        }
      }
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat pendaftaran.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 py-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl glass-card p-12 relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(16,185,129,0.2)] border-2 border-emerald-500/20 relative overflow-hidden group hover:scale-105 transition-transform duration-500">
            <img 
              src="https://i.imgur.com/6buHyBO.png" 
              alt="PAK TO Logo" 
              className="w-full h-full object-contain relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Daftar Akun</h1>
          <p className="text-zinc-500 mt-3 font-medium">Lengkapi data diri untuk pendaftaran PAK TO</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10 p-6 bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center space-x-4"
          >
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserPlus size={18} />
            </div>
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  type="text"
                  required
                  className="glass-input w-full pl-12 pr-4 py-4"
                  placeholder="Nama Lengkap"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Nomor WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  type="tel"
                  required
                  className="glass-input w-full pl-12 pr-4 py-4"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="email"
                required
                className="glass-input w-full pl-12 pr-4 py-4"
                placeholder="email@anda.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Alamat Lengkap</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <textarea
                required
                rows={3}
                className="glass-input w-full pl-12 pr-4 py-4 resize-none"
                placeholder="Alamat Lengkap (Dusun, RT/RW)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Pilih Desa</label>
            <div className="relative group">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <select
                required
                className="glass-input w-full pl-12 pr-4 py-4 appearance-none cursor-pointer"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              >
                <option value="" className="bg-zinc-900">Pilih Desa</option>
                {VILLAGES.map(v => (
                  <option key={v} value={v} className="bg-zinc-900">{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="password"
                required
                className="glass-input w-full pl-12 pr-4 py-4"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-5 text-xl shadow-2xl shadow-emerald-900/20 group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            ) : (
              <>
                <UserPlus size={24} className="group-hover:scale-110 transition-transform" />
                <span className="uppercase tracking-[0.2em] font-black">Daftar Sekarang</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-12 text-center text-zinc-500 text-sm font-medium">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">
            Masuk ke Akun
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
