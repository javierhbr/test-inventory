import { create } from 'zustand';

import { executionApi } from '../services/apiClient';
import { CartItem, Test, TestDataRecord } from '../services/types';

interface ExecutionState {
  tests: Test[];
  executionTestData: TestDataRecord[];
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
  isLoading: boolean;
  loadError: string | null;
  actionError: string | null;
}

interface ExecutionActions {
  loadExecutionData: () => Promise<void>;

  // Cart actions
  addToCart: (test: Test) => void;
  removeFromCart: (testId: string) => void;
  removeFilteredCart: (filteredCartIds: Set<string>) => void;
  clearCart: () => void;
  addSelectedToCart: () => void;
  assignTestData: () => Promise<void>;

  // CSV import
  setCsvInput: (input: string) => void;
  handleCsvImport: () => Promise<void>;
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

const initialState: ExecutionState = {
  tests: [],
  executionTestData: [],
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
  isLoading: false,
  loadError: null,
  actionError: null,
};

export const useExecutionStore = create<ExecutionStore>()((set, get) => ({
  ...initialState,

  loadExecutionData: async () => {
    set({
      isLoading: true,
      loadError: null,
    });

    try {
      const [tests, executionTestData] = await Promise.all([
        executionApi.listTests(),
        executionApi.listTestData(),
      ]);

      set({
        tests,
        executionTestData,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        loadError:
          error instanceof Error
            ? error.message
            : 'Failed to load execution data',
      });
    }
  },

  // Cart actions
  addToCart: test =>
    set(state =>
      state.cart.some(item => item.test.id === test.id)
        ? state
        : { cart: [...state.cart, { test }] }
    ),

  removeFromCart: testId =>
    set(state => ({
      cart: state.cart.filter(item => item.test.id !== testId),
    })),

  removeFilteredCart: filteredCartIds =>
    set(state => ({
      cart: state.cart.filter(item => !filteredCartIds.has(item.test.id)),
      cartCurrentPage: 1,
    })),

  clearCart: () => set({ cart: [], cartCurrentPage: 1 }),

  addSelectedToCart: () => {
    const { tests, selectedTests, cart } = get();
    const testsToAdd = tests.filter(test => selectedTests.has(test.id));
    const newCartItems = testsToAdd
      .filter(test => !cart.some(item => item.test.id === test.id))
      .map(test => ({ test }));
    set({
      cart: [...cart, ...newCartItems],
      selectedTests: new Set<string>(),
    });
  },

  assignTestData: async () => {
    const { cart } = get();

    if (cart.length === 0) {
      return;
    }

    try {
      const payload = cart.map(item => ({
        id: item.test.id,
        dataRequirements: item.test.dataRequirements,
      }));
      const response = await executionApi.assignTestData(payload);
      const assignedByTestId = new Map(
        response.assignments.map(item => [item.testId, item.assignedTestData])
      );

      set(state => ({
        cart: state.cart.map(item => {
          const assignedTestData = assignedByTestId.get(item.test.id);
          return assignedTestData
            ? {
                ...item,
                assignedTestData,
              }
            : item;
        }),
        actionError: null,
      }));
    } catch (error) {
      set({
        actionError:
          error instanceof Error ? error.message : 'Failed to assign test data',
      });
    }
  },

  // CSV import
  setCsvInput: input => set({ csvInput: input }),

  handleCsvImport: async () => {
    const { csvInput, cart } = get();
    if (!csvInput.trim()) {
      return;
    }

    try {
      const response = await executionApi.importCsv(csvInput);
      const newCartItems = response.tests
        .filter(test => !cart.some(item => item.test.id === test.id))
        .map(test => ({ test }));

      const warning =
        response.invalidTestIds.length > 0
          ? `Ignored unknown test IDs: ${response.invalidTestIds.join(', ')}`
          : null;

      set({
        cart: [...cart, ...newCartItems],
        csvInput: '',
        showCsvDialog: false,
        actionError: warning,
      });
    } catch (error) {
      set({
        actionError:
          error instanceof Error
            ? error.message
            : 'Failed to import tests from CSV',
      });
    }
  },

  setShowCsvDialog: show => set({ showCsvDialog: show }),

  // YAML
  setShowYamlDialog: show => set({ showYamlDialog: show }),
  setShowValidationModal: show => set({ showValidationModal: show }),
  setGeneratedYaml: yaml => set({ generatedYaml: yaml }),

  // Filters
  setSearchTerm: term => set({ searchTerm: term, currentPage: 1 }),
  setFilterFlow: flow => set({ filterFlow: flow, currentPage: 1 }),
  setFilterStatus: status => set({ filterStatus: status, currentPage: 1 }),
  setFilterRuntime: runtime => set({ filterRuntime: runtime, currentPage: 1 }),
  setFilterTeam: team => set({ filterTeam: team, currentPage: 1 }),
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
    set(state => {
      const next = new Set(state.selectedTests);
      if (checked) next.add(testId);
      else next.delete(testId);
      return { selectedTests: next };
    }),

  selectAllOnPage: (checked, pageTestIds) =>
    set(state => {
      const next = new Set(state.selectedTests);
      if (checked) {
        pageTestIds.forEach(id => next.add(id));
      } else {
        pageTestIds.forEach(id => next.delete(id));
      }
      return { selectedTests: next };
    }),

  selectAllTests: testIds => set({ selectedTests: new Set(testIds) }),

  clearSelection: () => set({ selectedTests: new Set<string>() }),
  setSelectAllPages: value => set({ selectAllPages: value }),

  // Runtime & pagination
  setSelectedRuntime: runtime => set({ selectedRuntime: runtime }),
  setCurrentPage: page => set({ currentPage: page }),
  setCartCurrentPage: page => set({ cartCurrentPage: page }),
  setCartSearchFilter: filter =>
    set({ cartSearchFilter: filter, cartCurrentPage: 1 }),
}));

// Derived selector: filtered tests (not in cart)
export const selectFilteredTests = (state: ExecutionStore): Test[] => {
  const cartIds = new Set(state.cart.map(item => item.test.id));

  return state.tests.filter(test => {
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
          test.supportedRuntimes.some(r =>
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
    item => item.test.labels.flow === state.cartSearchFilter
  );
};
