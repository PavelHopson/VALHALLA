
import { User, PlanTier, Theme } from './types';
import { generateId } from './utils';

// --- INTERNAL TYPE FOR STORAGE ---
interface StoredUser extends User {
  password?: string;
}

// --- HARDCODED SEED USER ---
const SEED_USER: any = {
  id: 'user_pavel_hopson_admin',
  name: 'PavelHopson',
  email: 'garaa11@mail.ru',
  password: 'Zeref1997', // In a real app, hash this!
  plan: PlanTier.FREE,
  xp: 1250,
  level: 3,
  theme: 'blue',
  hasSeenOnboarding: false,
  createdAt: Date.now()
};

class ApiService {
  private DB_USERS_KEY = 'lumina_users_db';

  constructor() {
    this.initializeDB();
  }

  // Seed the DB with the hardcoded user if missing
  private initializeDB() {
    const usersStr = localStorage.getItem(this.DB_USERS_KEY);
    let users: any[] = usersStr ? JSON.parse(usersStr) : [];

    const exists = users.find(u => u.email === SEED_USER.email);
    if (!exists) {
      users.push(SEED_USER);
      localStorage.setItem(this.DB_USERS_KEY, JSON.stringify(users));
      console.log('API: Seeded User PavelHopson');
    }
  }

  // --- USERS ---

  public getAllUsers(): StoredUser[] {
    const usersStr = localStorage.getItem(this.DB_USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  public login(email: string, password: string): User | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser as User;
    }
    return null;
  }

  public getUserById(id: string): User | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === id);
    if (user) {
        const { password, ...safeUser } = user;
        return safeUser as User;
    }
    return null;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(this.DB_USERS_KEY, JSON.stringify(users));
      const { password, ...safeUser } = users[index];
      return safeUser as User;
    }
    return null;
  }

  // --- DATA ---

  public getData<T>(key: string, userId: string): T {
    const val = localStorage.getItem(`${key}_${userId}`);
    return val ? JSON.parse(val) : ([] as any);
  }

  public saveData<T>(key: string, userId: string, data: T) {
    localStorage.setItem(`${key}_${userId}`, JSON.stringify(data));
  }
}

export const api = new ApiService();
