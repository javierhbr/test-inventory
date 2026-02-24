import { create } from 'zustand';

import { Test } from '../services/types';
import { mockTests } from '../data/mockTests';

interface TestsState {
  tests: Test[];
  searchTerm: string;
  filterFlow: string | string[];
  filterStatus: string | string[];
  filterRuntime: string | string[];
  filterTeam: string | string[];
  selectedTest: Test | null;
  editingTest: Test | null;
  selectedTestIds: Set<string>;
  currentPage: number;
  selectAllPages: boolean;
  showDeleteDialog: boolean;
  testToDelete: Test | null;
}

interface TestsActions {
  // Data mutations
  addTest: (test: Test) => void;
  updateTest: (updatedTest: Test) => void;
  deleteTest: (testId: string) => void;
  bulkDelete: (testIds: Set<string>) => void;

  // Filters
  setSearchTerm: (term: string) => void;
  setFilterFlow: (flow: string | string[]) => void;
  setFilterStatus: (status: string | string[]) => void;
  setFilterRuntime: (runtime: string | string[]) => void;
  setFilterTeam: (team: string | string[]) => void;
  clearFilters: () => void;

  // UI state
  setSelectedTest: (test: Test | null) => void;
  setEditingTest: (test: Test | null) => void;
  toggleTestSelection: (testId: string, checked: boolean) => void;
  selectAllOnPage: (checked: boolean, pageTestIds: string[]) => void;
  selectAllTests: (testIds: string[]) => void;
  clearSelection: () => void;
  setCurrentPage: (page: number) => void;
  setSelectAllPages: (value: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setTestToDelete: (test: Test | null) => void;
}

type TestsStore = TestsState & TestsActions;

export const useTestsStore = create<TestsStore>()((set) => ({
  // Initial state
  tests: mockTests,
  searchTerm: '',
  filterFlow: 'all',
  filterStatus: 'all',
  filterRuntime: 'all',
  filterTeam: 'all',
  selectedTest: null,
  editingTest: null,
  selectedTestIds: new Set<string>(),
  currentPage: 1,
  selectAllPages: false,
  showDeleteDialog: false,
  testToDelete: null,

  // Data mutations
  addTest: (test) =>
    set((state) => ({ tests: [...state.tests, test] })),

  updateTest: (updatedTest) =>
    set((state) => ({
      tests: state.tests.map((t) =>
        t.id === updatedTest.id ? updatedTest : t
      ),
      editingTest: null,
    })),

  deleteTest: (testId) =>
    set((state) => {
      const newSelectedIds = new Set(state.selectedTestIds);
      newSelectedIds.delete(testId);
      return {
        tests: state.tests.filter((t) => t.id !== testId),
        selectedTestIds: newSelectedIds,
        testToDelete: null,
        showDeleteDialog: false,
      };
    }),

  bulkDelete: (testIds) =>
    set((state) => ({
      tests: state.tests.filter((test) => !testIds.has(test.id)),
      selectedTestIds: new Set<string>(),
    })),

  // Filters
  setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
  setFilterFlow: (flow) => set({ filterFlow: flow, currentPage: 1 }),
  setFilterStatus: (status) => set({ filterStatus: status, currentPage: 1 }),
  setFilterRuntime: (runtime) =>
    set({ filterRuntime: runtime, currentPage: 1 }),
  setFilterTeam: (team) => set({ filterTeam: team, currentPage: 1 }),
  clearFilters: () =>
    set({
      searchTerm: '',
      filterFlow: 'all',
      filterStatus: 'all',
      filterRuntime: 'all',
      filterTeam: 'all',
      currentPage: 1,
    }),

  // UI state
  setSelectedTest: (test) => set({ selectedTest: test }),
  setEditingTest: (test) => set({ editingTest: test }),

  toggleTestSelection: (testId, checked) =>
    set((state) => {
      const next = new Set(state.selectedTestIds);
      if (checked) next.add(testId);
      else next.delete(testId);
      return { selectedTestIds: next };
    }),

  selectAllOnPage: (checked, pageTestIds) =>
    set((state) => {
      const next = new Set(state.selectedTestIds);
      if (checked) {
        pageTestIds.forEach((id) => next.add(id));
      } else {
        pageTestIds.forEach((id) => next.delete(id));
      }
      return { selectedTestIds: next };
    }),

  selectAllTests: (testIds) =>
    set({ selectedTestIds: new Set(testIds) }),

  clearSelection: () => set({ selectedTestIds: new Set<string>() }),

  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectAllPages: (value) => set({ selectAllPages: value }),
  setShowDeleteDialog: (show) => set({ showDeleteDialog: show }),
  setTestToDelete: (test) => set({ testToDelete: test }),
}));

// Derived selector: filtered tests
export const selectFilteredTests = (state: TestsStore): Test[] => {
  return state.tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      test.flow.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      test.id.toLowerCase().includes(state.searchTerm.toLowerCase());

    const matchesFlow =
      state.filterFlow === 'all' ||
      (Array.isArray(state.filterFlow)
        ? state.filterFlow.includes('all') ||
          state.filterFlow.includes(test.labels.flow)
        : test.labels.flow === state.filterFlow);

    const matchesStatus =
      state.filterStatus === 'all' ||
      (Array.isArray(state.filterStatus)
        ? state.filterStatus.includes('all') ||
          (test.lastExecution &&
            state.filterStatus.includes(test.lastExecution.status))
        : test.lastExecution?.status === state.filterStatus);

    const matchesRuntime =
      state.filterRuntime === 'all' ||
      (Array.isArray(state.filterRuntime)
        ? state.filterRuntime.includes('all') ||
          test.supportedRuntimes.some((r) =>
            (state.filterRuntime as string[]).includes(r)
          )
        : test.supportedRuntimes.includes(state.filterRuntime as string));

    const matchesTeam =
      state.filterTeam === 'all' ||
      (Array.isArray(state.filterTeam)
        ? state.filterTeam.includes('all') ||
          state.filterTeam.includes(test.team)
        : test.team === state.filterTeam);

    return (
      matchesSearch &&
      matchesFlow &&
      matchesStatus &&
      matchesRuntime &&
      matchesTeam
    );
  });
};
