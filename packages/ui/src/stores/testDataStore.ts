import { create } from 'zustand';

import { TestDataRecord } from '../services/types';

interface TestDataState {
  testData: TestDataRecord[];
  searchTerm: string;
  filterStatus: string | string[];
  filterScope: string | string[];
  filterAmbiente: string | string[];
  filterProyecto: string | string[];
  filterTeam: string | string[];
  selectedTestData: TestDataRecord | null;
  selectedDataIds: Set<string>;
  currentPage: number;
  itemsPerPage: number;
  selectAllPages: boolean;

  // Column specific filters and sort
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
}

interface TestDataActions {
  // Data mutations
  setTestData: (data: TestDataRecord[]) => void;
  addTestData: (data: TestDataRecord) => void;
  updateTestData: (data: TestDataRecord) => void;
  deleteTestData: (id: string) => void;
  bulkDelete: (ids: Set<string>) => void;
  reconditionTestData: (id: string) => void;

  // Filters
  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: string | string[]) => void;
  setFilterScope: (scope: string | string[]) => void;
  setFilterAmbiente: (ambiente: string | string[]) => void;
  setFilterProyecto: (proyecto: string | string[]) => void;
  setFilterTeam: (team: string | string[]) => void;
  clearFilters: () => void;
  setSort: (column: string | null, direction: 'asc' | 'desc' | null) => void;

  // UI state
  setSelectedTestData: (data: TestDataRecord | null) => void;
  toggleDataSelection: (dataId: string, checked: boolean) => void;
  selectAllOnPage: (checked: boolean, pageDataIds: string[]) => void;
  selectAllData: (dataIds: string[]) => void;
  clearSelection: () => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setSelectAllPages: (value: boolean) => void;
}

type TestDataStore = TestDataState & TestDataActions;

const initialState: TestDataState = {
  testData: [],
  searchTerm: '',
  filterStatus: 'all',
  filterScope: 'all',
  filterAmbiente: 'all',
  filterProyecto: 'all',
  filterTeam: 'all',
  selectedTestData: null,
  selectedDataIds: new Set<string>(),
  currentPage: 1,
  itemsPerPage: 15,
  selectAllPages: false,
  sortColumn: null,
  sortDirection: null,
};

export const useTestDataStore = create<TestDataStore>()(set => ({
  ...initialState,

  // Data mutations
  setTestData: data => set({ testData: data }),

  addTestData: data => set(state => ({ testData: [...state.testData, data] })),

  updateTestData: data =>
    set(state => ({
      testData: state.testData.map(item => (item.id === data.id ? data : item)),
    })),

  deleteTestData: id =>
    set(state => {
      const newSelectedIds = new Set(state.selectedDataIds);
      newSelectedIds.delete(id);
      return {
        testData: state.testData.filter(item => item.id !== id),
        selectedDataIds: newSelectedIds,
      };
    }),

  bulkDelete: ids =>
    set(state => ({
      testData: state.testData.filter(item => !ids.has(item.id)),
      selectedDataIds: new Set<string>(),
    })),

  reconditionTestData: id =>
    set(state => ({
      testData: state.testData.map(item =>
        item.id === id ? { ...item, status: 'Reconditioning' as const } : item
      ),
    })),

  // Filters
  setSearchTerm: term => set({ searchTerm: term, currentPage: 1 }),
  setFilterStatus: status => set({ filterStatus: status, currentPage: 1 }),
  setFilterScope: scope => set({ filterScope: scope, currentPage: 1 }),
  setFilterAmbiente: ambiente =>
    set({ filterAmbiente: ambiente, currentPage: 1 }),
  setFilterProyecto: proyecto =>
    set({ filterProyecto: proyecto, currentPage: 1 }),
  setFilterTeam: team => set({ filterTeam: team, currentPage: 1 }),
  clearFilters: () =>
    set({
      searchTerm: '',
      filterStatus: 'all',
      filterScope: 'all',
      filterAmbiente: 'all',
      filterProyecto: 'all',
      filterTeam: 'all',
      currentPage: 1,
      sortColumn: null,
      sortDirection: null,
    }),
  setSort: (column, direction) =>
    set({ sortColumn: column, sortDirection: direction }),

  // UI state
  setSelectedTestData: data => set({ selectedTestData: data }),

  toggleDataSelection: (dataId, checked) =>
    set(state => {
      const next = new Set(state.selectedDataIds);
      if (checked) next.add(dataId);
      else next.delete(dataId);
      return { selectedDataIds: next };
    }),

  selectAllOnPage: (checked, pageDataIds) =>
    set(state => {
      const next = new Set(state.selectedDataIds);
      if (checked) {
        pageDataIds.forEach(id => next.add(id));
      } else {
        pageDataIds.forEach(id => next.delete(id));
      }
      return { selectedDataIds: next };
    }),

  selectAllData: dataIds => set({ selectedDataIds: new Set(dataIds) }),

  clearSelection: () => set({ selectedDataIds: new Set<string>() }),

  setCurrentPage: page => set({ currentPage: page }),
  setItemsPerPage: itemsPerPage => set({ itemsPerPage, currentPage: 1 }),
  setSelectAllPages: value => set({ selectAllPages: value }),
}));

// Derived selector: filtered test data
export const selectFilteredTestData = (
  state: TestDataStore
): TestDataRecord[] => {
  let filtered = state.testData.filter(data => {
    const matchesSearch =
      data.id.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      data.customer.name
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase()) ||
      data.customer.customerId
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase()) ||
      data.account.referenceId
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase());

    const matchesStatus =
      state.filterStatus === 'all' ||
      (Array.isArray(state.filterStatus)
        ? state.filterStatus.includes('all') ||
          state.filterStatus.includes(data.status)
        : data.status === state.filterStatus);

    const matchesScope =
      state.filterScope === 'all' ||
      (Array.isArray(state.filterScope)
        ? state.filterScope.includes('all') ||
          state.filterScope.includes(data.scope.visibility)
        : data.scope.visibility === state.filterScope);

    const matchesAmbiente =
      state.filterAmbiente === 'all' ||
      (Array.isArray(state.filterAmbiente)
        ? state.filterAmbiente.includes('all') ||
          state.filterAmbiente.includes(data.labels.environment)
        : data.labels.environment === state.filterAmbiente);

    const matchesProyecto =
      state.filterProyecto === 'all' ||
      (Array.isArray(state.filterProyecto)
        ? state.filterProyecto.includes('all') ||
          state.filterProyecto.includes(data.labels.project)
        : data.labels.project === state.filterProyecto);

    const matchesTeam =
      state.filterTeam === 'all' ||
      (Array.isArray(state.filterTeam)
        ? state.filterTeam.includes('all') ||
          state.filterTeam.includes(data.team)
        : data.team === state.filterTeam);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesScope &&
      matchesAmbiente &&
      matchesProyecto &&
      matchesTeam
    );
  });

  if (state.sortColumn && state.sortDirection) {
    filtered = [...filtered].sort((a, b) => {
      let aValue: string | number = a[
        state.sortColumn as keyof TestDataRecord
      ] as string;
      let bValue: string | number = b[
        state.sortColumn as keyof TestDataRecord
      ] as string;

      if (state.sortColumn === 'customer') {
        aValue = a.customer.name;
        bValue = b.customer.name;
      } else if (state.sortColumn === 'accountRef') {
        aValue = a.account.referenceId;
        bValue = b.account.referenceId;
      } else if (state.sortColumn === 'type') {
        aValue = a.account.type;
        bValue = b.account.type;
      } else if (state.sortColumn === 'lastUsed') {
        aValue = a.lastUsed ? new Date(a.lastUsed.date).getTime() : 0;
        bValue = b.lastUsed ? new Date(b.lastUsed.date).getTime() : 0;
      } else if (state.sortColumn === 'scope') {
        aValue = a.scope.visibility;
        bValue = b.scope.visibility;
      }

      if (aValue < bValue) return state.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtered;
};
