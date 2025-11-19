
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ReminderView from './components/ReminderView';
import StickerBoard from './components/StickerBoard';
import CalendarView from './components/CalendarView';
import WorkoutView from './components/WorkoutView';
import SettingsView from './components/SettingsView';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import GlobalSearch from './components/GlobalSearch';
import Auth from './components/Auth';
import AdBanner from './components/AdBanner';
import SubscriptionModal from './components/SubscriptionModal';
import Onboarding from './components/Onboarding';

import { Reminder, Note, ViewMode, RepeatType, Priority, User, Category, Routine, WorkoutLog, PlanTier, ReminderStatus, Theme } from './types';
import { generateId, playNotificationSound, getNextOccurrence, calculateLevel, getNextLevelXp } from './utils';
import { BellRing, X, Search, Trophy, Hammer } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n';
import { api } from './api'; // Use the API layer

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  
  // -- Auth & User --
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lumina_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  // -- App State --
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // -- Data State --
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  const [activeToast, setActiveToast] = useState<{title: string, desc: string} | null>(null);
  const [levelUpToast, setLevelUpToast] = useState<number | null>(null);

  // -- Reminder Modal State --
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalData, setModalData] = useState({
    title: '',
    desc: '',
    date: '',
    repeat: RepeatType.NONE,
    priority: Priority.MEDIUM,
    category: Category.PERSONAL,
    subtasks: [] as {id: string, title: string, isCompleted: boolean}[]
  });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // -- Initialization --
  useEffect(() => {
    if (user) {
      // Reload fresh user data from API to catch plan changes etc.
      const freshUser = api.getUserById(user.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(user)) {
          setUser(freshUser);
          localStorage.setItem('lumina_active_session', JSON.stringify(freshUser));
      }

      if (freshUser && !freshUser.hasSeenOnboarding) {
          setShowOnboarding(true);
      }

      // Load Data via API
      setReminders(api.getData('reminders', user.id));
      setNotes(api.getData('notes', user.id));
      setRoutines(api.getData('routines', user.id));
      setWorkoutLogs(api.getData('workout_logs', user.id));
      
      // Enable saving only after initial load
      setIsDataLoaded(true);
    } else {
      localStorage.removeItem('lumina_active_session');
      setReminders([]);
      setNotes([]);
      setRoutines([]);
      setWorkoutLogs([]);
      setIsDataLoaded(false);
    }
  }, [user?.id]); // Run when ID changes or mounts

  // -- Persistence (Auto-Save) --
  useEffect(() => { 
      if (user && isDataLoaded) api.saveData('reminders', user.id, reminders); 
  }, [reminders, user, isDataLoaded]);

  useEffect(() => { 
      if (user && isDataLoaded) api.saveData('notes', user.id, notes); 
  }, [notes, user, isDataLoaded]);

  useEffect(() => { 
      if (user && isDataLoaded) api.saveData('routines', user.id, routines); 
  }, [routines, user, isDataLoaded]);

  useEffect(() => { 
      if (user && isDataLoaded) api.saveData('workout_logs', user.id, workoutLogs); 
  }, [workoutLogs, user, isDataLoaded]);

  // -- Gamification Logic --
  const addXp = (amount: number) => {
      if (!user || user.plan === PlanTier.FREE) return;
      const newXp = user.xp + amount;
      const newLevel = calculateLevel(newXp);
      
      if (newLevel > user.level) {
          setLevelUpToast(newLevel);
          playNotificationSound();
      }

      const updated = api.updateUser(user.id, { xp: newXp, level: newLevel });
      if (updated) setUser(updated);
  };

  // -- Dark Mode --
  useEffect(() => {
    const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // -- Keyboard Shortcuts --
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!user) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsReminderModalOpen(false);
        setSelectedDay(null);
        setIsSubscriptionOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  // -- Notifications --
  useEffect(() => {
    if (!user) return;
    if (Notification.permission === 'default') Notification.requestPermission();
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (reminder.isCompleted) return;
        const due = new Date(reminder.dueDateTime);
        const diff = due.getTime() - now.getTime();
        if (diff <= 0 && diff > -60000) {
            if (Notification.permission === 'granted') {
               new Notification(reminder.title, { body: reminder.priority, icon: '/vite.svg' });
            }
            setActiveToast({ title: reminder.title, desc: 'Task Due!' });
            playNotificationSound();
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [reminders, user]);

  useEffect(() => {
    if (activeToast || levelUpToast) {
      const timer = setTimeout(() => { setActiveToast(null); setLevelUpToast(null); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, levelUpToast]);

  // -- Handlers --

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleUpgrade = (plan: PlanTier) => {
      if (!user) return;
      const updated = api.updateUser(user.id, { plan });
      if (updated) setUser(updated);
      setIsSubscriptionOpen(false);
      alert(`Successfully upgraded to ${plan}!`);
  };

  const handleThemeChange = (theme: Theme) => {
      if (!user) return;
      const updated = api.updateUser(user.id, { theme });
      if (updated) setUser(updated);
  };

  const handleOnboardingComplete = () => {
      if (!user) return;
      const updated = api.updateUser(user.id, { hasSeenOnboarding: true });
      if (updated) setUser(updated);
      setShowOnboarding(false);
  };

  // Reminder Logic
  const saveReminder = (r: Partial<Reminder>) => {
    if (!user) return;
    
    const newReminder: Reminder = {
        id: r.id || generateId(),
        title: r.title || 'New Task',
        description: r.description || '',
        dueDateTime: r.dueDateTime || new Date().toISOString(),
        repeatType: r.repeatType || RepeatType.NONE,
        priority: r.priority || Priority.MEDIUM,
        category: r.category || Category.PERSONAL,
        isCompleted: false,
        status: ReminderStatus.TODO,
        createdAt: Date.now(),
        subtasks: r.subtasks || []
    };

    if (r.id) {
        setReminders(prev => prev.map(x => x.id === r.id ? { ...x, ...r } as Reminder : x));
    } else {
        setReminders(prev => [...prev, newReminder]);
    }
    setIsReminderModalOpen(false);
  };

  const toggleComplete = (id: string) => {
    setReminders(prev => {
        const task = prev.find(r => r.id === id);
        if (!task) return prev;
        
        const isNowComplete = !task.isCompleted;
        
        // Gamification
        if (isNowComplete) addXp(50);

        if (isNowComplete && task.repeatType !== RepeatType.NONE) {
            const nextDate = getNextOccurrence(new Date(task.dueDateTime), task.repeatType);
            const nextTask: Reminder = {
                ...task,
                id: generateId(),
                dueDateTime: nextDate.toISOString(),
                isCompleted: false,
                status: ReminderStatus.TODO,
                createdAt: Date.now(),
                subtasks: task.subtasks?.map(s => ({...s, isCompleted: false}))
            };
            return [...prev.map(r => r.id === id ? { ...r, isCompleted: true, status: ReminderStatus.DONE } : r), nextTask];
        }
        return prev.map(r => r.id === id ? { ...r, isCompleted: isNowComplete, status: isNowComplete ? ReminderStatus.DONE : ReminderStatus.TODO } : r);
    });
  };

  const changeStatus = (id: string, status: ReminderStatus) => {
      setReminders(prev => prev.map(r => {
          if (r.id === id) {
              const isCompleted = status === ReminderStatus.DONE;
              if (isCompleted && !r.isCompleted) addXp(50);
              return { ...r, status, isCompleted };
          }
          return r;
      }));
  };

  const deleteReminder = (id: string) => {
      if(confirm('Delete task?')) setReminders(prev => prev.filter(r => r.id !== id));
  };

  // --- Render ---

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shrink-0 z-20">
          <div className="flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-lg">
                  <Hammer className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white tracking-widest uppercase font-serif">VALHALLA</span>
          </div>
          <button onClick={() => setIsSearchOpen(true)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><Search className="w-5 h-5" /></button>
      </div>

      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        onSearchClick={() => setIsSearchOpen(true)}
        user={user}
        onUpgrade={() => setIsSubscriptionOpen(true)}
      />
      
      <main className="flex-1 h-full relative flex flex-col min-w-0 overflow-hidden mb-[60px] md:mb-0">
        {currentView === 'dashboard' && <Dashboard reminders={reminders} setView={setCurrentView} user={user} />}
        {currentView === 'reminders' && <ReminderView 
            reminders={reminders} 
            toggleComplete={toggleComplete}
            deleteReminder={deleteReminder}
            onOpenCreateModal={() => { setEditingId(null); setIsReminderModalOpen(true); }}
            onEditReminder={(r) => { setEditingId(r.id); setModalData({...r} as any); setIsReminderModalOpen(true); }}
            onAddSmartTask={(r) => saveReminder(r)}
            onStatusChange={changeStatus}
            userPlan={user.plan}
            onUpgrade={() => setIsSubscriptionOpen(true)}
        />}
        {currentView === 'stickers' && <StickerBoard notes={notes} setNotes={setNotes} />}
        {currentView === 'calendar' && <CalendarView reminders={reminders} onSelectDate={(d) => { setSelectedDay(d); }} />}
        {currentView === 'workouts' && <WorkoutView routines={routines} logs={workoutLogs} setRoutines={setRoutines} setLogs={setWorkoutLogs} />}
        {currentView === 'settings' && <SettingsView 
            remindersCount={reminders.length} 
            notesCount={notes.length} 
            user={user}
            onLogout={() => setUser(null)}
            setReminders={setReminders}
            setNotes={setNotes}
            onUpdateTheme={handleThemeChange}
            onUpgrade={() => setIsSubscriptionOpen(true)}
        />}
        {currentView === 'admin' && <AdminPanel reminders={reminders} notes={notes} setReminders={setReminders} setNotes={setNotes} />}
      </main>

      {/* Overlays */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} reminders={reminders} notes={notes} onNavigate={setCurrentView} />
      
      {/* Create Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-end md:items-center justify-center z-[60] backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white dark:bg-slate-950 w-full rounded-t-2xl md:rounded-2xl shadow-2xl md:max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-xl font-bold dark:text-white">{editingId ? t('tasks.modal_title').replace('New', 'Edit') : t('tasks.modal_title')}</h3>
              <button onClick={() => setIsReminderModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t('tasks.modal_name')}</label><input type="text" value={modalData.title} onChange={(e) => setModalData(p => ({...p, title: e.target.value}))} className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 outline-none font-medium text-lg dark:text-white" autoFocus /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t('tasks.modal_details')}</label><textarea value={modalData.desc} onChange={(e) => setModalData(p => ({...p, desc: e.target.value}))} className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-24 resize-none text-sm dark:text-slate-300" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t('tasks.modal_date')}</label><input type="datetime-local" value={modalData.date} onChange={(e) => setModalData(p => ({...p, date: e.target.value}))} className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:text-slate-300" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t('tasks.modal_priority')}</label><select value={modalData.priority} onChange={(e) => setModalData(p => ({...p, priority: e.target.value as Priority}))} className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:text-slate-300">{Object.values(Priority).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setIsReminderModalOpen(false)} className="px-5 py-3 text-slate-600 dark:text-slate-400 font-semibold text-sm">{t('tasks.modal_cancel')}</button>
              <button onClick={() => saveReminder({id: editingId || undefined, ...modalData})} disabled={!modalData.title} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg">{t('tasks.modal_save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {selectedDay && (
         <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[55] backdrop-blur-sm p-4">
             <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold dark:text-white">{selectedDay.toLocaleDateString()}</h3>
                    <button onClick={() => setSelectedDay(null)}><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {reminders.filter(r => new Date(r.dueDateTime).toDateString() === selectedDay.toDateString()).map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div className={`w-2 h-2 rounded-full ${r.isCompleted ? 'bg-slate-300' : 'bg-blue-500'}`}></div>
                            <div><p className="font-medium text-sm dark:text-white">{r.title}</p></div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800"><button onClick={() => { setModalData({...modalData, date: selectedDay.toISOString().slice(0,16)}); setIsReminderModalOpen(true); setSelectedDay(null); }} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm">{t('tasks.new_task')}</button></div>
             </div>
         </div>
      )}

      {/* Subscription Modal */}
      {isSubscriptionOpen && user && (
          <SubscriptionModal currentPlan={user.plan} onSelectPlan={handleUpgrade} onClose={() => setIsSubscriptionOpen(false)} />
      )}

      {/* Onboarding */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* Ad Banner */}
      {user?.plan === PlanTier.FREE && <AdBanner onUpgrade={() => setIsSubscriptionOpen(true)} onClose={() => {}} />}

      {/* Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-20 md:bottom-8 right-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 max-w-sm z-[100] flex items-start gap-4 cursor-pointer" onClick={() => { setCurrentView('reminders'); setActiveToast(null); }}>
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600"><BellRing className="w-6 h-6" /></div>
          <div><h4 className="font-bold dark:text-white">{activeToast.title}</h4><p className="text-sm text-slate-500">{activeToast.desc}</p></div>
        </div>
      )}

      {/* Level Up Toast */}
      {levelUpToast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 px-6 py-3 rounded-full shadow-2xl z-[100] font-bold flex items-center gap-2 animate-bounce">
              <Trophy className="w-5 h-5" />
              {t('game.toast_levelup')} {levelUpToast}!
          </div>
      )}
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
