import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';

const REQUEST_TYPES = [
  {
    id: 'SKTM',
    title: 'SKTM (Surat Keterangan Tidak Mampu)',
    requirements: [
      'Surat Pengantar Desa',
      'Kartu Keluarga (KK)',
      'KTP',
      'Lainnya (Opsional)'
    ]
  },
  {
    id: 'Dispensasi Nikah',
    title: 'Dispensasi Nikah',
    requirements: [
      'Surat Pengantar Desa',
      'KK Calon Pengantin',
      'KTP Calon Pengantin',
      'Pas Foto',
      'Pengantar Desa (Jika beda nama)'
    ]
  }
];

export default function CreateRequest() {
  const [type, setType] = useState('');
  const [formData, setFormData] = useState({
    nik: '',
    full_name_ktp: '',
    birth_info: '',
  });
  const [requirementFiles, setRequirementFiles] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (requirement: string, file: File | null) => {
    setRequirementFiles(prev => ({
      ...prev,
      [requirement]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return setError('Pilih jenis surat terlebih dahulu.');
    
    if (!formData.nik || !formData.full_name_ktp || !formData.birth_info) {
      return setError('Harap lengkapi data diri pemohon (NIK, Nama KTP, Tempat Tanggal Lahir).');
    }
    
    const currentRequirements = REQUEST_TYPES.find(rt => rt.id === type)?.requirements || [];
    const missingRequired = currentRequirements.filter(req => !req.includes('(Opsional)') && !requirementFiles[req]);
    
    if (missingRequired.length > 0) {
      return setError(`Harap unggah berkas wajib: ${missingRequired.join(', ')}`);
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesi berakhir, silakan login kembali.');

      // Ensure profile exists (fallback if trigger failed)
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!profile && !profileFetchError) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            full_name: user.user_metadata?.full_name || 'User',
            role: 'user'
          }, { onConflict: 'id' });
        
        if (profileError && profileError.code !== '23505') { // Ignore duplicate key error
          throw new Error(`Gagal membuat profil: ${profileError.message}`);
        }
      }

      const uploadedUrls = [];
      for (const [reqName, fileObj] of Object.entries(requirementFiles)) {
        if (!fileObj) continue;
        const file = fileObj as File;

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('requirements-bucket')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('requirements-bucket')
          .getPublicUrl(fileName);
        
        uploadedUrls.push({ 
          requirementName: reqName, 
          url: publicUrl, 
          name: file.name 
        });
      }

      const { error: insertError } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          type,
          requirements: uploadedUrls,
          status: 'pending',
          nik: formData.nik,
          full_name_ktp: formData.full_name_ktp,
          birth_info: formData.birth_info
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Gagal menyimpan pengajuan: ${insertError.message}`);
      }

      setSuccess(true);
      setTimeout(() => navigate('/history'), 2000);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Terjadi kesalahan saat mengirim pengajuan.');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = REQUEST_TYPES.find(rt => rt.id === type);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="relative py-8">
        <div className="absolute -left-4 top-0 w-1 h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Buat Pengajuan Surat</h1>
        <p className="text-zinc-400 mt-2 text-lg font-medium">Lengkapi formulir dan unggah persyaratan yang diperlukan.</p>
      </header>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card p-12 text-center bg-emerald-500/5 border-emerald-500/20"
        >
          <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-xl shadow-emerald-900/20">
            <CheckCircle size={48} className="animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Pengajuan Berhasil!</h2>
          <p className="text-zinc-400 text-lg font-medium max-w-md mx-auto leading-relaxed">Pengajuan Anda telah diterima dan akan segera diproses oleh admin.</p>
          <div className="mt-10 flex items-center justify-center space-x-3 text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Mengalihkan ke riwayat...</span>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="glass-card p-10 space-y-10">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8">Pilih Jenis Surat</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {REQUEST_TYPES.map((rt) => (
                  <label
                    key={rt.id}
                    className={`relative flex flex-col p-8 cursor-pointer rounded-3xl border-2 transition-all duration-300 group ${
                      type === rt.id 
                        ? 'border-emerald-500 bg-emerald-500/5 shadow-xl shadow-emerald-900/20' 
                        : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      className="sr-only"
                      value={rt.id}
                      onChange={(e) => {
                        setType(e.target.value);
                        setRequirementFiles({});
                      }}
                    />
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        type === rt.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40' : 'bg-white/5 text-zinc-500 group-hover:text-zinc-300'
                      }`}>
                        <FileText size={28} />
                      </div>
                      {type === rt.id && (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <CheckCircle size={14} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xl font-bold tracking-tight transition-colors ${type === rt.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{rt.title}</div>
                      <div className="text-xs text-zinc-500 mt-3 font-medium leading-relaxed">Persyaratan: {rt.requirements.join(', ')}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {type && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-10 border-t border-white/5 space-y-10"
              >
                <div className="space-y-8">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6">Data Diri Pemohon (Sesuai KTP)</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Nomor NIK</label>
                      <input
                        type="text"
                        required
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        className="glass-input w-full px-6 py-4"
                        placeholder="16 digit NIK"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Nama Sesuai KTP</label>
                      <input
                        type="text"
                        required
                        value={formData.full_name_ktp}
                        onChange={(e) => setFormData({ ...formData, full_name_ktp: e.target.value })}
                        className="glass-input w-full px-6 py-4"
                        placeholder="Nama Lengkap"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Tempat Tanggal Lahir</label>
                    <input
                      type="text"
                      required
                      value={formData.birth_info}
                      onChange={(e) => setFormData({ ...formData, birth_info: e.target.value })}
                      className="glass-input w-full px-6 py-4"
                      placeholder="Contoh: Batang, 01-01-1990"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info size={20} />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-blue-400 uppercase tracking-widest text-[10px] mb-2">Instruksi Pengunggahan</p>
                    <p className="text-blue-100/70 leading-relaxed">Silakan unggah berkas untuk setiap kategori di bawah ini. Berkas dapat berupa PDF atau Gambar (JPG/PNG).</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6">Unggah Berkas Persyaratan</label>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {selectedType?.requirements.map((req, index) => (
                      <div key={index} className="p-8 glass-card bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-white tracking-tight flex items-center">
                              {req}
                              {!req.includes('(Opsional)') && <span className="text-red-500 ml-1.5 font-black">!</span>}
                            </h4>
                            <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-widest">
                              {requirementFiles[req] ? 'Berkas terpilih' : 'Belum ada berkas'}
                            </p>
                          </div>
                          
                          <div className="relative group">
                            <input
                              type="file"
                              onChange={(e) => handleFileChange(req, e.target.files?.[0] || null)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all border ${
                              requirementFiles[req] 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-white/5 text-zinc-400 border-white/5 group-hover:border-emerald-500/30 group-hover:text-zinc-200'
                            }`}>
                              <Upload size={18} />
                              <span>{requirementFiles[req] ? 'Ganti File' : 'Pilih File'}</span>
                            </div>
                          </div>
                        </div>

                        {requirementFiles[req] && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 flex items-center space-x-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5"
                          >
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/20">
                              <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-200 truncate">{requirementFiles[req]?.name}</p>
                              <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">{(requirementFiles[req]!.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleFileChange(req, null)}
                              className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            >
                              <AlertCircle size={18} />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-red-500/5 border border-red-500/20 text-red-400 text-sm font-bold rounded-2xl flex items-center space-x-4"
            >
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} />
              </div>
              <span className="uppercase tracking-widest text-xs leading-relaxed">{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !type}
            className="btn-primary w-full py-6 text-xl shadow-2xl shadow-emerald-900/40 flex items-center justify-center space-x-4 disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            ) : (
              <>
                <CheckCircle size={24} className="group-hover:scale-110 transition-transform" />
                <span className="uppercase tracking-[0.2em] font-black">Kirim Pengajuan</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
