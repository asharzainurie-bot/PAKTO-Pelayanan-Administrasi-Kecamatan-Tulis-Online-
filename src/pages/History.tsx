import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, CheckCircle, AlertCircle, Download, Search, Filter } from 'lucide-react';

export default function History() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (data) setRequests(data);
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Riwayat Pengajuan</h1>
          <p className="text-zinc-400 mt-2 text-lg font-medium">Daftar semua pengajuan surat yang pernah Anda buat.</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500">
            <Filter size={20} />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="glass-input px-6 py-3 appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="all" className="bg-zinc-900">Semua Status</option>
            <option value="pending" className="bg-zinc-900">Menunggu</option>
            <option value="processing" className="bg-zinc-900">Diproses</option>
            <option value="completed" className="bg-zinc-900">Selesai</option>
            <option value="rejected" className="bg-zinc-900">Ditolak</option>
          </select>
        </div>
      </header>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.01] text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5 text-left font-bold">Jenis Surat</th>
                <th className="px-8 py-5 text-left font-bold">Tanggal Pengajuan</th>
                <th className="px-8 py-5 text-left font-bold">Status</th>
                <th className="px-8 py-5 text-left font-bold">Catatan Admin</th>
                <th className="px-8 py-5 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 font-medium italic">Memuat data...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 font-medium italic">
                    <div className="flex flex-col items-center">
                      <Search size={48} className="text-zinc-800 mb-4" />
                      <p>Tidak ada pengajuan ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-zinc-100 group-hover:text-emerald-500 transition-colors">{req.type}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">ID: {req.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-400 font-medium">
                      {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-500 italic font-medium max-w-xs truncate">
                      {req.admin_notes || '-'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {req.status === 'completed' && req.result_url ? (
                        <a
                          href={req.result_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-3 text-emerald-500 hover:text-white font-bold text-xs uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500 px-6 py-3 rounded-2xl transition-all border border-emerald-500/20"
                        >
                          <Download size={18} />
                          <span>Unduh Surat</span>
                        </a>
                      ) : (
                        <span className="text-zinc-700 text-xs font-bold uppercase tracking-widest italic">Belum tersedia</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
