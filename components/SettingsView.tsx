
import React, { useRef } from 'react';
import { Download, Cloud, Moon, Shield, Crown, ChevronRight, Languages, User as UserIcon, LogOut, Upload, Zap, Trophy, Palette } from 'lucide-react';
import { useLanguage } from '../i18n';
import { User, Reminder, Note, PlanTier, Theme } from '../types';
import { THEME_COLORS, getNextLevelXp } from '../utils';

interface SettingsViewProps {
  remindersCount: number;
  notesCount: number;
  user?: User | null;
  onLogout?: () => void;
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  onUpdateTheme: (theme: Theme) => void;
  onUpgrade: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    user, onLogout, setReminders, setNotes, onUpdateTheme, onUpgrade 
}) => {
  const { language, setLanguage, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      reminders: JSON.parse(localStorage.getItem(`reminders_${user?.id}`) || '[]'),
      notes: JSON.parse(localStorage.getItem(`notes_${user?.id}`) || '[]'),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.reminders && Array.isArray(json.reminders)) setReminders(json.reminders);
        if (json.notes && Array.isArray(json.notes)) setNotes(json.notes);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isPro = user?.plan !== PlanTier.FREE;

  return (
    <div className="p-8 h-full flex flex-col max-w-4xl mx-auto w-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">{t('settings.title')}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{t('settings.subtitle')}</p>

      {/* User Profile */}
      {user && (
        <section className="mb-8">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">{t('settings.profile')}</h4>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                    <h5 className="font-bold text-slate-900 dark:text-white">{user.name}</h5>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${user.plan === PlanTier.PRO ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{user.plan}</span>
                </div>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              {t('settings.logout')}
            </button>
          </div>
        </section>
      )}
      
      {/* Gamification Stats (Pro) */}
      {user && user.plan !== PlanTier.FREE && (
          <section className="mb-8">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">{t('plan.feature_game')}</h4>
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                      <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Trophy className="w-6 h-6"/></div>
                      <div>
                          <p className="text-xs text-slate-400 uppercase font-bold">{t('game.level')}</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.level}</p>
                      </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Zap className="w-6 h-6"/></div>
                      <div>
                          <p className="text-xs text-slate-400 uppercase font-bold">{t('game.xp')}</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.xp} <span className="text-sm text-slate-400 font-medium">/ {getNextLevelXp(user.level)}</span></p>
                      </div>
                  </div>
              </div>
          </section>
      )}

      {/* Plan Info */}
      {user?.plan !== PlanTier.PRO && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white mb-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold">{t('settings.workspace')}</h3>
                    <p className="text-slate-400 text-sm mt-1">Current: {user?.plan}. Upgrade to unlock Themes & AI.</p>
                </div>
                <button onClick={onUpgrade} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg transition-colors flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    {t('settings.upgrade')}
                </button>
            </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Language */}
        <section>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">{t('settings.language')}</h4>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden p-2 flex gap-2">
               <button onClick={() => setLanguage('en')} className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${language === 'en' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>🇺🇸 English</button>
               <button onClick={() => setLanguage('ru')} className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${language === 'ru' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>🇷🇺 Русский</button>
            </div>
        </section>

        {/* Appearance (Themes) */}
        <section>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">{t('settings.appearance')}</h4>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Moon className="w-5 h-5" /></div>
                        <div>
                            <h5 className="font-semibold text-slate-800 dark:text-white">{t('settings.dark_mode')}</h5>
                            <p className="text-xs text-slate-500">{t('settings.dark_mode_desc')}</p>
                        </div>
                    </div>
                </div>
                
                {/* Theme Selector (Standard+) */}
                <div className={`p-4 flex items-center justify-between ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Palette className="w-5 h-5" /></div>
                        <div>
                            <h5 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                {t('settings.theme')}
                                {!isPro && <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded border border-amber-200">PRO</span>}
                            </h5>
                            <div className="flex gap-2 mt-2">
                                {(Object.keys(THEME_COLORS) as Theme[]).map(th => (
                                    <button 
                                        key={th} 
                                        onClick={() => onUpdateTheme(th)}
                                        className={`w-6 h-6 rounded-full ${THEME_COLORS[th].primary} ${user?.theme === th ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    {!isPro && <Shield className="w-5 h-5 text-slate-400" />}
                </div>
            </div>
        </section>

        {/* Data */}
        <section>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">{t('settings.data')}</h4>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Download className="w-5 h-5" /></div>
                        <div>
                            <h5 className="font-semibold text-slate-800 dark:text-white">{t('settings.export')}</h5>
                            <p className="text-xs text-slate-500">{t('settings.export_desc')}</p>
                        </div>
                    </div>
                    <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg">{t('settings.export_btn')}</button>
                </div>
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Upload className="w-5 h-5" /></div>
                        <div>
                            <h5 className="font-semibold text-slate-800 dark:text-white">{t('settings.import')}</h5>
                            <p className="text-xs text-slate-500">{t('settings.import_desc')}</p>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                    <button onClick={handleImportClick} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg">{t('settings.import_btn')}</button>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
