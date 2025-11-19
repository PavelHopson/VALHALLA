
import React from 'react';
import { ViewMode, User, PlanTier, Theme } from '../types';
import { Hammer, CheckSquare, StickyNote, Calendar as CalendarIcon, Settings, Crown, ShieldCheck, Home, Search, Dumbbell } from 'lucide-react';
import { useLanguage } from '../i18n';
import { THEME_COLORS } from '../utils';

interface NavigationProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  onSearchClick: () => void;
  user?: User | null;
  onUpgrade: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, onSearchClick, user, onUpgrade }) => {
  const { t } = useLanguage();
  const theme = user?.theme && user.plan !== PlanTier.FREE ? THEME_COLORS[user.theme] : THEME_COLORS.blue;

  const navItems = [
    { id: 'dashboard', label: t('nav.home'), icon: Home },
    { id: 'reminders', label: t('nav.tasks'), icon: CheckSquare },
    { id: 'calendar', label: t('nav.calendar'), icon: CalendarIcon },
    { id: 'workouts', label: t('nav.workouts'), icon: Dumbbell },
    { id: 'stickers', label: t('nav.notes'), icon: StickyNote },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ] as const;

  // --- DESKTOP SIDEBAR ---
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 bg-slate-900 dark:bg-slate-950 text-white flex-col h-full shrink-0 shadow-2xl z-30 font-sans transition-colors duration-300 border-r border-slate-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 dark:border-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black pointer-events-none"></div>
          <div className={`${theme.primary} p-2 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.2)] relative z-10 border border-white/10`}>
            <Hammer className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <h1 className="font-bold text-xl tracking-widest uppercase font-serif">VALHALLA</h1>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">System</span>
          </div>
        </div>

        {/* Quick Search */}
        <div className="px-4 pt-6 pb-2">
          <button 
              onClick={onSearchClick}
              className="w-full bg-slate-800/50 dark:bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-400 rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm transition-all group"
          >
              <Search className="w-4 h-4 group-hover:text-white transition-colors" />
              <span className="group-hover:text-slate-200">{t('nav.search')}</span>
              <span className="ml-auto text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 font-mono shadow-sm">Ctrl K</span>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewMode)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? `${theme.primary} text-white shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] border border-white/10` 
                    : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium tracking-wide text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 space-y-3 border-t border-slate-800">
          {user?.plan !== PlanTier.PRO && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden group cursor-pointer shadow-lg">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-white/10 transition-all"></div>
                <div className="flex items-center gap-2 mb-2 relative z-10">
                <Crown className="w-4 h-4 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                <span className="text-xs font-bold text-white tracking-wide">{t('nav.pro_access')}</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-3 leading-relaxed relative z-10 font-medium">{t('nav.pro_desc')}</p>
                <button onClick={onUpgrade} className="w-full py-1.5 text-[10px] font-bold uppercase tracking-widest bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors shadow-md relative z-10 border border-slate-600">
                {t('nav.upgrade')}
                </button>
            </div>
          )}

          <button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${currentView === 'admin' ? 'bg-red-900/20 text-red-400 border border-red-500/20' : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/30'}`}>
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('nav.admin')}</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 z-50 pb-safe">
         <div className="flex items-center justify-around px-2 py-3 overflow-x-auto">
            {navItems.slice(0, 5).map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id as ViewMode)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[64px] ${
                            isActive ? `text-${theme.primary.replace('bg-', '')}-600 dark:text-white` : 'text-slate-400'
                        }`}
                    >
                        <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
                    </button>
                );
            })}
         </div>
      </div>
    </>
  );
};

export default Navigation;
