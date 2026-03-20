import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  Settings, Users, Building, Database, BarChart3, 
  Save, Shield, Globe, Info, AlertCircle 
} from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [kecamatan, setKecamatan] = useState<any>({
    name: '',
    address: '',
    phone: '',
    logo_url: ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    pending: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKecamatan();
    fetchUsers();
    fetchStats();
  }, []);

  const fetchKecamatan = async () => {
    const { data } = await supabase.from('kecamatan_profile').select('*').single();
    if (data) setKecamatan(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const fetchStats = async () => {
    const { data } = await supabase.from('requests').select('status');
    if (data) {
      setStats({
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        completed: data.filter(r => r.status === 'completed').length
      });
    }
  };

  const handleUpdateKecamatan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('kecamatan_profile')
      .update(kecamatan)
      .eq('id', 1);
    
    if (!error) alert('Profil kecamatan berhasil diperbarui!');
    setLoading(false);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <header>
        <h1 className="text-4xl font-bold text-white tracking-tight">Pengaturan & Laporan</h1>
        <p className="text-zinc-400 mt-2 text-lg font-medium">Konfigurasi sistem dan pantau performa layanan.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-72 shrink-0">
          <nav className="flex lg:flex-col gap-3 glass-card p-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <Building size={20} />
              <span>Profil Kecamatan</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'users' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <Users size={20} />
              <span>Manajemen User</span>
            </button>
            <button
              onClick={() => setActiveTab('supabase')}
              className={`flex items-center space-x-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'supabase' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <Database size={20} />
              <span>Integrasi Supabase</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center space-x-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <BarChart3 size={20} />
              <span>Laporan</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10"
          >
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Building size={20} />
                  </div>
                  <span>Profil Kecamatan</span>
                </h2>
                <form onSubmit={handleUpdateKecamatan} className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Nama Kecamatan</label>
                    <input
                      type="text"
                      value={kecamatan.name}
                      onChange={(e) => setKecamatan({ ...kecamatan, name: e.target.value })}
                      className="w-full px-6 py-4 bg-white text-black font-bold rounded-2xl border border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                      placeholder="Contoh: Kecamatan Tulis"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Alamat Kantor</label>
                    <textarea
                      rows={3}
                      value={kecamatan.address}
                      onChange={(e) => setKecamatan({ ...kecamatan, address: e.target.value })}
                      className="w-full px-6 py-4 bg-white text-black font-bold rounded-2xl border border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                      placeholder="Alamat lengkap kantor kecamatan"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Nomor Telepon</label>
                    <input
                      type="text"
                      value={kecamatan.phone}
                      onChange={(e) => setKecamatan({ ...kecamatan, phone: e.target.value })}
                      className="w-full px-6 py-4 bg-white text-black font-bold rounded-2xl border border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                      placeholder="Nomor telepon kantor"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-10 py-4 text-lg shadow-xl shadow-emerald-900/20"
                  >
                    <Save size={20} />
                    <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Users size={20} />
                  </div>
                  <span>Manajemen User</span>
                </h2>
                <div className="overflow-x-auto -mx-10">
                  <table className="w-full">
                    <thead className="bg-white/[0.01] text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-10 py-5 text-left font-bold">Nama & ID</th>
                        <th className="px-10 py-5 text-left font-bold">Telepon</th>
                        <th className="px-10 py-5 text-left font-bold">Role</th>
                        <th className="px-10 py-5 text-left font-bold">Terdaftar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-6">
                            <div className="font-bold text-zinc-100 group-hover:text-emerald-500 transition-colors">{user.full_name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">ID: {user.id.slice(0, 8)}</div>
                          </td>
                          <td className="px-10 py-6 text-sm text-zinc-400 font-medium">{user.phone || '-'}</td>
                          <td className="px-10 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                              user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-sm text-zinc-400 font-medium">
                            {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'supabase' && (
              <div className="space-y-10">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Database size={20} />
                  </div>
                  <span>Integrasi Supabase</span>
                </h2>
                
                <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-start space-x-5">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-500 text-lg">Keamanan Database</h4>
                    <p className="text-zinc-400 mt-2 font-medium">Pastikan Anda telah mengaktifkan Row Level Security (RLS) di Supabase dan menjalankan script SQL yang disediakan untuk keamanan data.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="p-6 glass-card bg-white/[0.02]">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Supabase URL</div>
                    <code className="text-sm text-emerald-500 font-mono break-all bg-emerald-500/5 px-4 py-2 rounded-lg border border-emerald-500/10 block w-full">{import.meta.env.VITE_SUPABASE_URL || 'Not Configured'}</code>
                  </div>
                  <div className="p-6 glass-card bg-white/[0.02]">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3 ml-1">Supabase Anon Key</div>
                    <code className="text-sm text-emerald-500 font-mono break-all bg-emerald-500/5 px-4 py-2 rounded-lg border border-emerald-500/10 block w-full">{import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 30)}...</code>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5">
                  <h4 className="font-bold text-white mb-6 flex items-center space-x-3 text-lg">
                    <Globe size={20} className="text-zinc-500" />
                    <span>Status Bucket Storage</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 glass-card flex items-center justify-between bg-white/[0.02]">
                      <span className="text-sm font-bold text-zinc-300">requirements-bucket</span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-lg border border-emerald-500/20 uppercase tracking-wider">Active</span>
                    </div>
                    <div className="p-6 glass-card flex items-center justify-between bg-white/[0.02]">
                      <span className="text-sm font-bold text-zinc-300">results-bucket</span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-lg border border-emerald-500/20 uppercase tracking-wider">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-10">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <BarChart3 size={20} />
                  </div>
                  <span>Laporan Layanan</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-8 glass-card bg-white/[0.02] group hover:border-emerald-500/30 transition-all">
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Total Pengajuan</div>
                    <div className="text-5xl font-bold text-white mt-4 tracking-tighter group-hover:text-emerald-500 transition-colors">{stats.total}</div>
                  </div>
                  <div className="p-8 glass-card bg-white/[0.02] group hover:border-amber-500/30 transition-all">
                    <div className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em]">Menunggu Proses</div>
                    <div className="text-5xl font-bold text-white mt-4 tracking-tighter group-hover:text-amber-500 transition-colors">{stats.pending}</div>
                  </div>
                  <div className="p-8 glass-card bg-white/[0.02] group hover:border-emerald-500/30 transition-all">
                    <div className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em]">Selesai</div>
                    <div className="text-5xl font-bold text-white mt-4 tracking-tighter group-hover:text-emerald-500 transition-colors">{stats.completed}</div>
                  </div>
                </div>

                <div className="p-10 bg-zinc-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-black/50 border border-white/5">
                  <div className="relative z-10">
                    <h4 className="text-2xl font-bold mb-3 tracking-tight">Ringkasan Performa</h4>
                    <p className="text-zinc-400 font-medium mb-8">Persentase penyelesaian layanan bulan ini.</p>
                    <div className="flex items-end space-x-4">
                      <div className="text-7xl font-bold tracking-tighter text-emerald-500">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </div>
                      <div className="text-emerald-400/50 text-sm font-bold mb-4 flex items-center uppercase tracking-widest">
                        <BarChart3 size={16} className="mr-2" />
                        Target: 95%
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-[-40px] bottom-[-40px] opacity-5">
                    <BarChart3 size={300} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
