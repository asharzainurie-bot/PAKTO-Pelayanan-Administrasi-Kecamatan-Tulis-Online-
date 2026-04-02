import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Save, ArrowLeft, CheckCircle, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const VILLAGES = [
  'Beji', 'Cluwuk', 'Jolosekti', 'Jrakahpayung', 'Kaliboyo', 'Kebumen', 
  'Kedungsegog', 'Kenconorejo', 'Manggis', 'Ponowareng', 'Posong', 
  'Sembojo', 'Siberuk', 'Simbangjati', 'Simbangdesa', 'Tulis', 'Wringingintung'
];

export default function Profile({ profile: initialProfile, refreshProfile }: { profile: any, refreshProfile: () => void }) {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        village: profile.village,
      })
      .eq('id', profile.id);

    if (!error) {
      setSuccess(true);
      refreshProfile();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert('Gagal memperbarui profil: ' + error.message);
    }
    setLoading(false);
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Profil Saya</h1>
            <p className="text-zinc-400 mt-2 text-lg font-medium">Kelola informasi akun Anda.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-card p-8 text-center sticky top-32">
            <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 mx-auto mb-6 shadow-2xl shadow-emerald-900/20">
              <User size={64} />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">{profile.full_name}</h3>
            <p className="text-zinc-500 mt-2 font-medium uppercase tracking-widest text-xs">{profile.role}</p>
            
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">ID Pengguna</span>
                <span className="text-zinc-300 font-mono">{profile.id.slice(0, 8)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Status Akun</span>
                <span className="text-emerald-500 font-bold">Aktif</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10"
          >
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <User size={20} />
              </div>
              <span>Informasi Personal</span>
            </h2>

            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center space-x-3"
              >
                <CheckCircle size={20} />
                <span className="text-sm font-bold uppercase tracking-widest">Profil berhasil diperbarui!</span>
              </motion.div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="glass-input w-full pl-12 pr-4 py-4"
                      placeholder="Nama Lengkap"
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
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="glass-input w-full pl-12 pr-4 py-4"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Desa</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <select
                      required
                      value={profile.village}
                      onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                      className="glass-input w-full pl-12 pr-4 py-4 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-zinc-900">Pilih Desa</option>
                      {VILLAGES.map(v => (
                        <option key={v} value={v} className="bg-zinc-900">{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Alamat Lengkap</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <textarea
                    required
                    rows={4}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="glass-input w-full pl-12 pr-4 py-4 resize-none"
                    placeholder="Alamat Lengkap"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-10 py-4 text-lg shadow-xl shadow-emerald-900/20 flex items-center space-x-3"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
