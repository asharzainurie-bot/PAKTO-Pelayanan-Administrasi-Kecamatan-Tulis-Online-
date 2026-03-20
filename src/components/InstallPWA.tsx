import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the custom install UI
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the native install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-4 right-4 z-[9999] md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-zinc-900 border border-emerald-500/20 rounded-3xl p-6 shadow-2xl shadow-black/50 backdrop-blur-xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-start space-x-5">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 shrink-0">
                <Smartphone size={28} className="text-white" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Pasang Aplikasi PAKTO</h3>
                <p className="text-zinc-400 text-sm mt-1 font-medium">Instal di layar utama untuk akses lebih cepat dan mudah.</p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/20 active:scale-95"
              >
                <Download size={18} />
                <span className="text-sm uppercase tracking-widest">Pasang Sekarang</span>
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-bold rounded-xl transition-all text-sm uppercase tracking-widest active:scale-95"
              >
                Nanti
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
