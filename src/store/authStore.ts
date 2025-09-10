import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'artist' | 'investor';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  profileImage?: string;
  walletAddress?: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Mock authentication functions - replace with real API calls
const mockLogin = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation - multiple test accounts
  if (email === 'test@example.com' && password === 'password') {
    return {
      id: '1',
      email,
      username: 'testuser',
      role: 'investor',
      isVerified: true,
    };
  }
  
  if (email === 'shedywill@gmail.com' && password === 'mancity21') {
    return {
      id: '2',
      email,
      username: 'shedywill',
      role: 'artist',
      profileImage: 'https://via.placeholder.com/100x100/FFD700/000000?text=SW',
      isVerified: true,
    };
  }
  
  throw new Error('Invalid credentials');
};

const mockRegister = async (
  email: string,
  password: string,
  username: string,
  role: UserRole
): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user creation
  return {
    id: Date.now().toString(),
    email,
    username,
    role,
    isVerified: false,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const user = await mockLogin(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, username: string, role: UserRole) => {
        set({ isLoading: true });
        try {
          const user = await mockRegister(email, password, username, role);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'murex-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);