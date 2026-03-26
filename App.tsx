import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, UserCircle, Activity, Aperture } from 'lucide-react';
import { Toaster } from 'sonner';
import { CHVForm } from './components/CHVForm';
import { MinistryDashboard } from './components/MinistryDashboard';
import { DiagnosisCard } from './components/DiagnosisCard';
import { Diagnosis, AppMode } from './types';
import { cn } from './lib/utils';

const Logo = () => (
  <div className="relative w-10 h-10 flex items-center justify-center bg-slate-900 rounded-xl shadow-lg">
    <Activity className="absolute text-[#00FF9F] w-6 h-6 opacity-50 -translate-x-1" />
    <Aperture className="absolute text-[#00FF9F] w-6 h-6 translate-x-1" />
  </div>
);

export default function App() {
  const [mode, setMode] = useState<AppMode>('CHV');
  const [liveFeed, setLiveFeed] = useState<Diagnosis[]>([]);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<Diagnosis | null>(null);

  const handleAnalysisComplete = (diagnosis: Diagnosis) => {
    setCurrentDiagnosis(diagnosis);
    setLiveFeed((prev) => [diagnosis, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Toaster position="top-center" richColors />
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-bold text-2xl tracking-tighter text-slate-900 hidden sm:block">
              Haraka<span className="text-slate-500">Health</span>
            </span>
          </div>

          {/* Mode Toggle Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setMode('CHV')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                mode === 'CHV' 
                  ? "bg-white text-brand-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <UserCircle className="w-4 h-4" />
              CHV Mode
            </button>
            <button
              onClick={() => setMode('MINISTRY')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                mode === 'MINISTRY' 
                  ? "bg-white text-brand-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Ministry Mode
            </button>
          </div>

          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full relative">
        <div className="pt-8 px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-slate-500 tracking-tight"
          >
            Instant AI Diagnostics for the Frontlines
          </motion.h2>
        </div>
        <AnimatePresence mode="wait">
          {mode === 'CHV' ? (
            <motion.div
              key="chv"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-8 px-4"
            >
              {!currentDiagnosis ? (
                <CHVForm onAnalysisComplete={handleAnalysisComplete} />
              ) : (
                <DiagnosisCard 
                  diagnosis={currentDiagnosis} 
                  onClose={() => setCurrentDiagnosis(null)} 
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="ministry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <MinistryDashboard liveFeed={liveFeed} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer (Mobile Only) */}
      <footer className="sm:hidden bg-white border-t border-slate-200 p-4 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Secured by Gemini Flash AI
        </p>
      </footer>
    </div>
  );
}
