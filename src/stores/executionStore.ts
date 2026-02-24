import { create } from 'zustand';

import { Test, CartItem } from '../services/types';
import { mockTests } from '../data/mockTests';

interface ExecutionState {
  tests: Test[];
  cart: CartItem[];
  searchTerm: string;
  filterFlow: string | string[];
  filterStatus: string | string[];
  filterRuntime: string | string[];
  filterTeam: string | string[];
  selectedTests: Set<string>;
  selectAllPages: boolean;
  selectedRuntime: string;
  csvInput: string;
  showCsvDialog: boolean;
  showYamlDialog: boolean;
  showValidationModal: boolean;
  generatedYaml: string;
  currentPage: number;
  cartCurrentPage: number;
  cartSearchFilter: string;
}

interface ExecutionActions {
  // Cart actions
  addToCart: (test: Test) => void;
  removeFromCart: (testId: string) => void;
  removeFilteredCart: (filteredCartIds: Set<string>) => void;
  clearCart: () => void;
  addSelectedToCart: () => void;
  assignTestData: () => void;

  // CSV import
  setCsvInput: (input: string) => void;
  handleCsvImport: () => void;
  setShowCsvDialog: (show: boolean) => void;

  // YAML
  setShowYamlDialog: (show: boolean) => void;
  setShowValidationModal: (show: boolean) => void;
  setGeneratedYaml: (yaml: string) => void;

  // Filters
  setSearchTerm: (term: string) => void;
  setFilterFlow: (flow: string | string[]) => void;
  setFilterStatus: (status: string | string[]) => void;
  setFilterRuntime: (runtime: string | string[]) => void;
  setFilterTeam: (team: string | string[]) => void;
  clearFilters: () => void;

  // Selection
  toggleTestSelection: (testId: string, checked: boolean) => void;
  selectAllOnPage: (checked: boolean, pageTestIds: string[]) => void;
  selectAllTests: (testIds: string[]) => void;
  clearSelection: () => void;
  setSelectAllPages: (value: boolean) => void;

  // Runtime & pagination
  setSelectedRuntime: (runtime: string) => void;
  setCurrentPage: (page: number) => void;
  setCartCurrentPage: (page: number) => void;
  setCartSearchFilter: (filter: string) => void;
}

type ExecutionStore = ExecutionState & ExecutionActions;

export const useExecutionStore = create<ExecutionStore>()((set, get) => ({
  // Initial state
  tests: mockTests,
  cart: [],
  searchTerm: '',
  filterFlow: 'all',
  filterStatus: 'all',
  filterRuntime: 'all',
  filterTeam: 'all',
  selectedTests: new Set<string>(),
  selectAllPages: false,
  selectedRuntime: '',
  csvInput: '',
  showCsvDialog: false,
  showYamlDialog: false,
  showValidationModal: false,
  generatedYaml: '',
  currentPage: 1,
  cartCurrentPage: 1,
  cartSearchFilter: 'all',

  // Cart actions
  addToCart: (test) =>
    set((state) => ({ cart: [...state.cart, { test }] })),

  removeFromCart: (testId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.test.id !== testId),
    })),

  removeFilteredCart: (filteredCartIds) =>
    set((state) => ({
      cart: state.cart.filter(
        (item) => !filteredCartIds.has(item.test.id)
      ),
      cartCurrentPage: 1,
    })),

  clearCart: () => set({ cart: [], cartCurrentPage: 1 }),

  addSelectedToCart: () => {
    const { tests, selectedTests, cart } = get();
    const testsToAdd = tests.filter((test) => selectedTests.has(test.id));
    const newCartItems = testsToAdd
      .filter((test) => !cart.some((item) => item.test.id === test.id))
      .map((test) => ({ test }));
    set({
      cart: [...cart, ...newCartItems],
      selectedTests: new Set<string>(),
    });
  },

  assignTestData: () =>
    set((state) => ({
      cart: state.cart.map((item) => {
        if (!item.assignedTestData) {
          return {
            ...item,
            assignedTestData: {
              id: `TD-${Math.random().toString(36).substring(2, 7)}`,
              accountId: `ACC-${Math.floor(Math.random() * 90000) + 10000}`,
              referenceId: `REF-${Math.floor(Math.random() * 90000) + 10000}`,
              customerId: `CUST-${Math.floor(Math.random() * 90000) + 10000}`,
              assignedAt: new Date().toISOString(),
              status: 'Assigned',
            },
          };
        }
        return item;
      }),
    })),

  // CSV import
  setCsvInput: (input) => set({ csvInput: input }),

  handleCsvImport: () => {
    const { csvInput, tests, cart } = get();
    const lines = csvInput.trim().split('\n');
    if (lines.length <= 1) return;

    const testIds = lines
      .slice(1)
      .map((line) => line.trim())
      .filter(Boolean);
    const testsToAdd = tests.filter((test) => testIds.includes(test.id));

    const newCartItems = testsToAdd
      .filter((test) => !cart.some((item) => item.test.id === test.id))
      .map((test) => ({ test }));

    set({
      cart: [...cart, ...newCartItems],
      csvInput: '',
      showCsvDialog: false,
    });
  },

  setShowCsvDialog: (show) => set({ showCsvDialog: show }),

  // YAML
  setShowYamlDialog: (show) => set({ showYamlDialog: show }),
  setShowValidationModal: (show) => set({ showValidationModal: show }),
  setGeneratedYaml: (yaml) => set({ generatedYaml: yaml }),

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

  // Selection
  toggleTestSelection: (testId, checked) =>
    set((state) => {
      const next = new Set(state.selectedTests);
      if (checked) next.add(testId);
      else next.delete(testId);
      return { selectedTests: next };
    }),

  selectAllOnPage: (checked, pageTestIds) =>
    set((state) => {
      const next = new Set(state.selectedTests);
      if (checked) {
        pageTestIds.forEach((id) => next.add(id));
      } else {
        pageTestIds.forEach((id) => next.delete(id));
      }
      return { selectedTests: next };
    }),

  selectAllTests: (testIds) =>
    set({ selectedTests: new Set(testIds) }),

  clearSelection: () => set({ selectedTests: new Set<string>() }),
  setSelectAllPages: (value) => set({ selectAllPages: value }),

  // Runtime & pagination
  setSelectedRuntime: (runtime) => set({ selectedRuntime: runtime }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setCartCurrentPage: (page) => set({ cartCurrentPage: page }),
  setCartSearchFilter: (filter) =>
    set({ cartSearchFilter: filter, cartCurrentPage: 1 }),
}));

// Derived selector: filtered tests (not in cart)
export const selectFilteredTests = (state: ExecutionStore): Test[] => {
  const cartIds = new Set(state.cart.map((item) => item.test.id));

  return state.tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
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

    const notInCart = !cartIds.has(test.id);

    return (
      matchesSearch &&
      matchesFlow &&
      matchesStatus &&
      matchesRuntime &&
      matchesTeam &&
      notInCart
    );
  });
};

// Derived selector: filtered cart items
export const selectFilteredCart = (state: ExecutionStore): CartItem[] => {
  if (state.cartSearchFilter === 'all') return state.cart;
  return state.cart.filter(
    (item) => item.test.labels.flow === state.cartSearchFilter
  );
};
