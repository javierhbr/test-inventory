import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Lob, LOB_VALUES, UserProfile } from '../services/types';

interface LobState {
  activeLob: Lob | 'all';
  isAdmin: boolean;
}

interface LobActions {
  setActiveLob: (lob: Lob | 'all') => void;
  initializeFromUser: (userLob: Lob, profile: UserProfile) => void;
}

type LobStore = LobState & LobActions;

const initialState: LobState = {
  activeLob: 'all',
  isAdmin: false,
};

export const useLobStore = create<LobStore>()(
  persist(
    set => ({
      ...initialState,

      setActiveLob: lob => set({ activeLob: lob }),

      initializeFromUser: (userLob, profile) =>
        set({
          activeLob: userLob,
          isAdmin: profile === 'admin',
        }),
    }),
    {
      name: 'lob-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        activeLob: state.activeLob,
        isAdmin: state.isAdmin,
      }),
    }
  )
);

export { LOB_VALUES };
