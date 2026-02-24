import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { User } from '../services/types';

interface AuthState {
  user: User | null;
}

interface AuthActions {
  login: (user: User) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,

      login: user => set({ user }),
      logout: () => {
        sessionStorage.removeItem('permissions-storage');
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({ user: state.user }),
    }
  )
);
