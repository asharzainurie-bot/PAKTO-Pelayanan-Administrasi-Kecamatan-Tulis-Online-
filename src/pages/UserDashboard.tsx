import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertCircle, ArrowRight, Download, History, User } from 'lucide-react';

export default function UserDashboard({ profile }: { profile: any }) {
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const fetchRecentRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) setRecentRequests(data);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-amber-500/20 flex items-center w-fit"><Clock size={12} className="mr-1.5" /> Menunggu</span>;
      case 'processing': return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-500/20 flex items-center w-fit"><Clock size={12} className="mr-1.5" /> Diproses</span>;
      case 'completed': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-500/20 flex items-center w-fit"><CheckCircle size={12} className="mr-1.5" /> Selesai</span>;
      case 'rejected': return <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-red-500/20 flex items-center w-fit"><AlertCircle size={12} className="mr-1.5" /> Ditolak</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <header className="relative py-8">
        <div className="absolute -left-4 top-0 w-1 h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Halo, {profile?.full_name}!</h1>
        <p className="text-zinc-400 mt-2 text-lg font-medium">Selamat datang di portal pelayanan mandiri Kecamatan Tulis.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          className="glass-card p-8 group cursor-pointer"
        >
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <FileText size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Buat Pengajuan Baru</h3>
          <p className="text-zinc-400 text-base leading-relaxed mb-8">Ajukan SKTM atau Dispensasi Nikah secara online tanpa harus antre.</p>
          <Link
            to="/create-request"
            className="inline-flex items-center space-x-3 text-emerald-500 font-bold hover:text-emerald-400 transition-colors group"
          >
            <span className="text-sm uppercase tracking-widest">Mulai Sekarang</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          className="glass-card p-8 group cursor-pointer"
        >
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
            <History size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Riwayat Pengajuan</h3>
          <p className="text-zinc-400 text-base leading-relaxed mb-8">Pantau status pengajuan Anda dan unduh surat yang telah selesai.</p>
          <Link
            to="/history"
            className="inline-flex items-center space-x-3 text-blue-500 font-bold hover:text-blue-400 transition-colors group"
          >
            <span className="text-sm uppercase tracking-widest">Lihat Semua</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          className="glass-card p-8 group cursor-pointer"
        >
          <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
            <User size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Profil Saya</h3>
          <p className="text-zinc-400 text-base leading-relaxed mb-8">Kelola informasi akun, nomor WhatsApp, dan alamat Anda.</p>
          <Link
            to="/profile"
            className="inline-flex items-center space-x-3 text-purple-500 font-bold hover:text-purple-400 transition-colors group"
          >
            <span className="text-sm uppercase tracking-widest">Edit Profil</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </div>

      <section className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white tracking-tight">Pengajuan Terakhir</h2>
          </div>
          <Link to="/history" className="text-sm font-bold text-zinc-500 hover:text-emerald-500 uppercase tracking-widest transition-colors">Lihat Semua</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.01] text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5 text-left font-bold">Jenis Surat</th>
                <th className="px-8 py-5 text-left font-bold">Tanggal</th>
                <th className="px-8 py-5 text-left font-bold">Status</th>
                <th className="px-8 py-5 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 font-medium italic">Memuat data...</td>
                </tr>
              ) : recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 font-medium italic">Belum ada pengajuan.</td>
                </tr>
              ) : (
                recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-zinc-100 group-hover:text-emerald-500 transition-colors">{req.type}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">ID: {req.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-400 font-medium">
                      {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {req.status === 'completed' && req.result_url ? (
                        <a
                          href={req.result_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-emerald-500 hover:text-emerald-400 font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                          <Download size={16} />
                          <span>Unduh</span>
                        </a>
                      ) : (
                        <span className="text-zinc-600 text-xs font-medium italic">Belum tersedia</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
