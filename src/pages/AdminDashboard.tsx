import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  Clock, CheckCircle, AlertCircle, Download, Search, 
  Filter, Eye, FileUp, User, Phone, MapPin, ExternalLink,
  Settings, Users, Building, BarChart3, LayoutDashboard,
  FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [shouldNotify, setShouldNotify] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    const { data } = await supabase.from('requests').select('status');
    if (data) {
      setStats({
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        processing: data.filter(r => r.status === 'processing').length,
        completed: data.filter(r => r.status === 'completed').length
      });
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase
      .from('requests')
      .select('*, profiles(full_name, phone, address)')
      .order('created_at', { ascending: false });
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (data) setRequests(data);
    setLoading(false);
  };

  const sendWhatsAppNotification = (req: any, newStatus: string, notes: string) => {
    const phone = req.profiles?.phone?.replace(/\D/g, '');
    if (!phone) return;

    const formattedPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone.startsWith('62') ? phone : '62' + phone;
    
    let statusText = '';
    switch (newStatus) {
      case 'pending': statusText = 'Menunggu'; break;
      case 'processing': statusText = 'Diproses'; break;
      case 'completed': statusText = 'Selesai'; break;
      case 'rejected': statusText = 'Ditolak'; break;
    }

    const namaKtp = req.full_name_ktp || req.profiles?.full_name || 'Pemohon';
    const nomerPengajuan = req.id.slice(0, 8);
    
    let message = `Selamat Datang di Portal PAK TO ( Pelayanan Administrasi Kecamatan Tulis Online ), Pengajuan ${req.type} anda, dengan nomer pengajuan ${nomerPengajuan} atas nama ${namaKtp} Berstatus ${statusText}. Terimakasih.`;

    if (newStatus === 'rejected' && notes) {
      message += ` Alasan: ${notes}`;
    }

    if (newStatus === 'completed') {
      message += ` Silahkan download Surat Administrasi pada menu Akun - Riwayat Pengajuan.`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (status === 'rejected' && !adminNotes) {
      alert('Mohon berikan alasan penolakan pada catatan admin.');
      return;
    }

    if (status === 'completed' && !selectedRequest.result_url) {
      alert('Mohon unggah hasil surat terlebih dahulu untuk status Selesai.');
      return;
    }

    const { error } = await supabase
      .from('requests')
      .update({
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedRequest.id);

    if (!error) {
      if (shouldNotify) {
        sendWhatsAppNotification(selectedRequest, status, adminNotes);
      }
      setSelectedRequest(null);
      fetchRequests();
    }
  };

  const handleUploadResult = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedRequest) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `results/${selectedRequest.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('results-bucket')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('results-bucket')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('requests')
        .update({ result_url: publicUrl })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;
      
      setSelectedRequest({ ...selectedRequest, result_url: publicUrl });
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
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
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard Admin</h1>
          <p className="text-zinc-400 mt-2 text-lg font-medium">Kelola semua pengajuan administrasi warga.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Cari pengajuan..." 
              className="glass-input pl-12 pr-4 py-3 w-full"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="glass-input px-6 py-3 w-full sm:w-auto appearance-none cursor-pointer"
          >
            <option value="all" className="bg-zinc-900">Semua Status</option>
            <option value="pending" className="bg-zinc-900">Menunggu</option>
            <option value="processing" className="bg-zinc-900">Diproses</option>
            <option value="completed" className="bg-zinc-900">Selesai</option>
            <option value="rejected" className="bg-zinc-900">Ditolak</option>
          </select>
        </div>
      </header>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/settings" className="glass-card p-6 hover:border-emerald-500/50 transition-all group">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <Settings size={24} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Pengaturan</h3>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Konfigurasi sistem & integrasi</p>
        </Link>
        
        <Link to="/admin/settings" className="glass-card p-6 hover:border-blue-500/50 transition-all group">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
            <Building size={24} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Profil Kecamatan</h3>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Informasi & alamat kantor</p>
        </Link>

        <Link to="/admin/settings" className="glass-card p-6 hover:border-purple-500/50 transition-all group">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Manajemen User</h3>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Kelola akun warga & admin</p>
        </Link>

        <Link to="/admin/settings" className="glass-card p-6 hover:border-amber-500/50 transition-all group">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
            <BarChart3 size={24} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Laporan</h3>
          <p className="text-sm text-zinc-500 mt-1 font-medium">Statistik & performa layanan</p>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <LayoutDashboard size={120} />
          </div>
          <div className="text-emerald-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Total Pengajuan</div>
          <div className="text-5xl font-bold tracking-tighter">{stats.total}</div>
        </div>
        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-amber-500">
            <Clock size={120} />
          </div>
          <div className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Menunggu</div>
          <div className="text-5xl font-bold text-white tracking-tighter">{stats.pending}</div>
        </div>
        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-blue-500">
            <Clock size={120} />
          </div>
          <div className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Diproses</div>
          <div className="text-5xl font-bold text-white tracking-tighter">{stats.processing}</div>
        </div>
        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-emerald-500">
            <CheckCircle size={120} />
          </div>
          <div className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Selesai</div>
          <div className="text-5xl font-bold text-white tracking-tighter">{stats.completed}</div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white tracking-tight">Daftar Pengajuan</h2>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <LayoutDashboard size={14} className="text-emerald-500" />
            <span>Real-time Update</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.01] text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5 text-left font-bold">Pemohon</th>
                <th className="px-8 py-5 text-left font-bold">Jenis Surat</th>
                <th className="px-8 py-5 text-left font-bold">Tanggal</th>
                <th className="px-8 py-5 text-left font-bold">Status</th>
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
                  <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 font-medium italic">Tidak ada pengajuan.</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-zinc-100 group-hover:text-emerald-500 transition-colors">{req.profiles?.full_name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">{req.profiles?.phone}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-semibold text-zinc-300">{req.type}</div>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-400 font-medium">
                      {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setAdminNotes(req.admin_notes || '');
                          setStatus(req.status);
                        }}
                        className="p-3 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-2xl transition-all"
                        title="Detail & Proses"
                      >
                        <Eye size={22} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-zinc-950 border border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedRequest.type}</h2>
                  <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-widest">ID: {selectedRequest.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                <AlertCircle size={28} className="rotate-45" />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-12">
                <section>
                  <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mb-6">Informasi Pemohon</h3>
                  <div className="glass-card p-8 space-y-6 bg-white/[0.02]">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Nama Lengkap</div>
                        <div className="font-bold text-white text-lg">{selectedRequest.profiles?.full_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400">
                        <Phone size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Nomor Telepon</div>
                        <div className="font-bold text-white text-lg">{selectedRequest.profiles?.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 mt-1">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Alamat</div>
                        <div className="font-bold text-white text-lg leading-relaxed">{selectedRequest.profiles?.address}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mb-6">Data Diri Sesuai KTP</h3>
                  <div className="glass-card p-8 space-y-6 bg-white/[0.02]">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Nomor NIK</div>
                        <div className="font-bold text-white text-lg">{selectedRequest.nik || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Nama Sesuai KTP</div>
                        <div className="font-bold text-white text-lg">{selectedRequest.full_name_ktp || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Tempat Tanggal Lahir</div>
                        <div className="font-bold text-white text-lg">{selectedRequest.birth_info || '-'}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mb-6">Berkas Persyaratan</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedRequest.requirements?.map((file: any, i: number) => (
                      <a
                        key={i}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-6 glass-card hover:border-emerald-500/50 transition-all group bg-white/[0.01]"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                            <Download size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">{file.requirementName}</span>
                            <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{file.name}</span>
                          </div>
                        </div>
                        <ExternalLink size={18} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                      </a>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-12">
                <section>
                  <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mb-6">Proses Administrasi</h3>
                  <form onSubmit={handleUpdateRequest} className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Status Pengajuan</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="glass-input w-full px-6 py-4 appearance-none cursor-pointer"
                      >
                        <option value="pending" className="bg-zinc-900">Menunggu</option>
                        <option value="processing" className="bg-zinc-900">Proses</option>
                        <option value="completed" className="bg-zinc-900">Selesai</option>
                        <option value="rejected" className="bg-zinc-900">Ditolak</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                        Catatan Admin {status === 'rejected' && <span className="text-red-500 font-black ml-1">!</span>}
                      </label>
                      <textarea
                        rows={4}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="glass-input w-full px-6 py-4 resize-none"
                        placeholder={status === 'rejected' ? "Tuliskan alasan penolakan di sini..." : "Tambahkan catatan untuk pemohon..."}
                      />
                    </div>

                    <div className="pt-8 border-t border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            id="notify-wa"
                            checked={shouldNotify}
                            onChange={(e) => setShouldNotify(e.target.checked)}
                            className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 text-emerald-500 focus:ring-emerald-500/20 transition-all cursor-pointer"
                          />
                          <label htmlFor="notify-wa" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-300 transition-colors">
                            Kirim Notifikasi WA saat Simpan
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => sendWhatsAppNotification(selectedRequest, status, adminNotes)}
                          className="flex items-center space-x-2 text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors"
                        >
                          <Phone size={14} />
                          <span>Kirim Manual</span>
                        </button>
                      </div>
                      <div className="relative group">
                        <input
                          type="file"
                          onChange={handleUploadResult}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-300 ${
                          selectedRequest.result_url 
                            ? 'border-emerald-500/50 bg-emerald-500/5' 
                            : 'border-white/10 bg-white/[0.02] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/[0.02]'
                        }`}>
                          {uploading ? (
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 mx-auto"></div>
                          ) : selectedRequest.result_url ? (
                            <div className="text-emerald-500">
                              <CheckCircle size={48} className="mx-auto mb-4 animate-bounce" />
                              <p className="text-lg font-bold tracking-tight">Surat Berhasil Diunggah</p>
                              <p className="text-xs font-medium text-zinc-500 mt-2 uppercase tracking-widest">Klik untuk mengganti file</p>
                            </div>
                          ) : (
                            <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                              <FileUp size={48} className="mx-auto mb-4" />
                              <p className="text-lg font-bold tracking-tight">Klik untuk unggah surat</p>
                              <p className="text-xs font-medium mt-2 uppercase tracking-widest">Hanya file PDF yang diperbolehkan</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full py-5 text-lg shadow-xl shadow-emerald-900/20"
                    >
                      Simpan Perubahan
                    </button>
                  </form>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
