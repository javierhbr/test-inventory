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

const initialState: AuthState = {
  user: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      ...initialState,

      login: user => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({ user: state.user }),
    }
  )
);
