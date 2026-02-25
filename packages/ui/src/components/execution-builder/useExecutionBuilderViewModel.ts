import { useShallow } from 'zustand/react/shallow';

import {
  selectFilteredCart,
  selectFilteredTests,
  useExecutionStore,
} from '../../stores/executionStore';
import { FilterConfig } from '../SearchAndFilters';

import {
  FLOW_OPTIONS,
  ITEMS_PER_PAGE,
  RUNTIME_OPTIONS,
  buildExecutionYaml,
  createExecutionFilename,
  getPaginationPages,
  PaginationPage,
} from './utils';

import type { CartItem, Test } from '../../services/types';

const FILTER_FLOW_OPTIONS = [
  { value: 'all', label: 'All flows' },
  ...FLOW_OPTIONS.map(value => ({ value, label: value })),
];

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'never', label: 'Never Run' },
];

const FILTER_RUNTIME_OPTIONS = [
  { value: 'all', label: 'All' },
  ...RUNTIME_OPTIONS.map(value => ({ value, label: value })),
];

const FILTER_TEAM_OPTIONS = [
  { value: 'all', label: 'All teams' },
  { value: 'QA Team', label: 'QA Team' },
  { value: 'Core Team', label: 'Core Team' },
  { value: 'Mobile Team', label: 'Mobile Team' },
  { value: 'Web Team', label: 'Web Team' },
];

export interface ExecutionBuilderViewModel {
  isLoading: boolean;
  loadError: string | null;
  actionError: string | null;
  loadExecutionData: () => Promise<void>;
  tests: Test[];
  cart: CartItem[];
  filteredTests: Test[];
  filteredCart: CartItem[];
  paginatedTests: Test[];
  paginatedCart: CartItem[];
  searchTerm: string;
  filterConfigs: FilterConfig[];
  clearFilters: () => void;
  selectedTests: Set<string>;
  selectedCount: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  handleSelectAll: (checked: boolean) => void;
  handleSelectTest: (testId: string, checked: boolean) => void;
  addToCart: (test: Test) => void;
  addSelectedToCart: () => void;
  showCsvDialog: boolean;
  setShowCsvDialog: (show: boolean) => void;
  csvInput: string;
  setCsvInput: (input: string) => void;
  handleCsvImport: () => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageNumbers: PaginationPage[];
  startIndex: number;
  endIndex: number;
  selectAllPages: boolean;
  setSelectAllPages: (value: boolean) => void;
  selectAllTests: (testIds: string[]) => void;
  cartTotalPages: number;
  cartCurrentPage: number;
  setCartCurrentPage: (page: number) => void;
  cartPageNumbers: PaginationPage[];
  cartStartIndex: number;
  cartEndIndex: number;
  cartSearchFilter: string;
  setCartSearchFilter: (filter: string) => void;
  handleRemoveFiltered: () => void;
  removeFromCart: (testId: string) => void;
  clearCart: () => void;
  selectedRuntime: string;
  setSelectedRuntime: (runtime: string) => void;
  assignTestData: () => void;
  handleExportYaml: () => void;
  assignedTestDataCount: number;
  showValidationModal: boolean;
  setShowValidationModal: (show: boolean) => void;
  showYamlDialog: boolean;
  setShowYamlDialog: (show: boolean) => void;
  generatedYaml: string;
  copyYamlToClipboard: () => void;
  downloadYaml: () => void;
  setSearchTerm: (term: string) => void;
}

export const useExecutionBuilderViewModel = (): ExecutionBuilderViewModel => {
  const isLoading = useExecutionStore(s => s.isLoading);
  const loadError = useExecutionStore(s => s.loadError);
  const actionError = useExecutionStore(s => s.actionError);
  const tests = useExecutionStore(s => s.tests);
  const cart = useExecutionStore(s => s.cart);
  const filteredTests = useExecutionStore(useShallow(selectFilteredTests));
  const filteredCart = useExecutionStore(useShallow(selectFilteredCart));
  const searchTerm = useExecutionStore(s => s.searchTerm);
  const filterFlow = useExecutionStore(s => s.filterFlow);
  const filterStatus = useExecutionStore(s => s.filterStatus);
  const filterRuntime = useExecutionStore(s => s.filterRuntime);
  const filterTeam = useExecutionStore(s => s.filterTeam);
  const selectedTests = useExecutionStore(s => s.selectedTests);
  const selectedRuntime = useExecutionStore(s => s.selectedRuntime);
  const csvInput = useExecutionStore(s => s.csvInput);
  const showCsvDialog = useExecutionStore(s => s.showCsvDialog);
  const showYamlDialog = useExecutionStore(s => s.showYamlDialog);
  const showValidationModal = useExecutionStore(s => s.showValidationModal);
  const generatedYaml = useExecutionStore(s => s.generatedYaml);
  const currentPage = useExecutionStore(s => s.currentPage);
  const selectAllPages = useExecutionStore(s => s.selectAllPages);
  const cartCurrentPage = useExecutionStore(s => s.cartCurrentPage);
  const cartSearchFilter = useExecutionStore(s => s.cartSearchFilter);

  const loadExecutionData = useExecutionStore(s => s.loadExecutionData);
  const setSearchTerm = useExecutionStore(s => s.setSearchTerm);
  const setFilterFlow = useExecutionStore(s => s.setFilterFlow);
  const setFilterStatus = useExecutionStore(s => s.setFilterStatus);
  const setFilterRuntime = useExecutionStore(s => s.setFilterRuntime);
  const setFilterTeam = useExecutionStore(s => s.setFilterTeam);
  const clearFilters = useExecutionStore(s => s.clearFilters);
  const addToCart = useExecutionStore(s => s.addToCart);
  const removeFromCart = useExecutionStore(s => s.removeFromCart);
  const removeFilteredCart = useExecutionStore(s => s.removeFilteredCart);
  const clearCart = useExecutionStore(s => s.clearCart);
  const addSelectedToCart = useExecutionStore(s => s.addSelectedToCart);
  const assignTestDataFromApi = useExecutionStore(s => s.assignTestData);
  const setCsvInput = useExecutionStore(s => s.setCsvInput);
  const handleCsvImportFromApi = useExecutionStore(s => s.handleCsvImport);
  const setShowCsvDialog = useExecutionStore(s => s.setShowCsvDialog);
  const setShowYamlDialog = useExecutionStore(s => s.setShowYamlDialog);
  const setShowValidationModal = useExecutionStore(
    s => s.setShowValidationModal
  );
  const setGeneratedYaml = useExecutionStore(s => s.setGeneratedYaml);
  const toggleTestSelection = useExecutionStore(s => s.toggleTestSelection);
  const selectAllOnPage = useExecutionStore(s => s.selectAllOnPage);
  const selectAllTests = useExecutionStore(s => s.selectAllTests);
  const clearSelection = useExecutionStore(s => s.clearSelection);
  const setSelectAllPages = useExecutionStore(s => s.setSelectAllPages);
  const setSelectedRuntime = useExecutionStore(s => s.setSelectedRuntime);
  const setCurrentPage = useExecutionStore(s => s.setCurrentPage);
  const setCartCurrentPage = useExecutionStore(s => s.setCartCurrentPage);
  const setCartSearchFilter = useExecutionStore(s => s.setCartSearchFilter);

  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTests = filteredTests.slice(startIndex, endIndex);

  const cartTotalPages = Math.ceil(filteredCart.length / ITEMS_PER_PAGE);
  const cartStartIndex = (cartCurrentPage - 1) * ITEMS_PER_PAGE;
  const cartEndIndex = cartStartIndex + ITEMS_PER_PAGE;
  const paginatedCart = filteredCart.slice(cartStartIndex, cartEndIndex);

  const selectedCount = selectedTests.size;
  const isCurrentPageSelected =
    paginatedTests.length > 0 &&
    paginatedTests.every(test => selectedTests.has(test.id));
  const isAllPagesSelected =
    filteredTests.length > 0 &&
    filteredTests.every(test => selectedTests.has(test.id));
  const isAllSelected = selectAllPages
    ? isAllPagesSelected
    : isCurrentPageSelected;
  const isIndeterminate = selectedCount > 0 && !isAllSelected;

  const filterConfigs: FilterConfig[] = [
    {
      key: 'flow',
      label: 'FLOW',
      placeholder: 'Flow',
      value: filterFlow,
      onChange: setFilterFlow,
      variant: 'multi',
      options: FILTER_FLOW_OPTIONS,
    },
    {
      key: 'status',
      label: 'STATUS',
      placeholder: 'Status',
      value: filterStatus,
      onChange: setFilterStatus,
      variant: 'multi',
      options: FILTER_STATUS_OPTIONS,
    },
    {
      key: 'runtime',
      label: 'RUNTIME',
      placeholder: 'Runtime',
      value: filterRuntime,
      onChange: setFilterRuntime,
      variant: 'multi',
      options: FILTER_RUNTIME_OPTIONS,
    },
    {
      key: 'team',
      label: 'TEAM',
      placeholder: 'Team',
      value: filterTeam,
      onChange: setFilterTeam,
      variant: 'multi',
      options: FILTER_TEAM_OPTIONS,
    },
  ];

  const handleSelectTest = (testId: string, checked: boolean) => {
    toggleTestSelection(testId, checked);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (selectAllPages) {
        selectAllTests(filteredTests.map(test => test.id));
      } else {
        selectAllOnPage(
          true,
          paginatedTests.map(test => test.id)
        );
      }
      return;
    }

    if (selectAllPages) {
      clearSelection();
    } else {
      selectAllOnPage(
        false,
        paginatedTests.map(test => test.id)
      );
    }
  };

  const handleRemoveFiltered = () => {
    const filteredCartIds = new Set(filteredCart.map(item => item.test.id));
    removeFilteredCart(filteredCartIds);
  };

  const assignTestData = () => {
    void assignTestDataFromApi();
  };

  const handleCsvImport = () => {
    void handleCsvImportFromApi();
  };

  const handleExportYaml = () => {
    if (cart.length === 0 || !selectedRuntime) {
      setShowValidationModal(true);
      return;
    }

    const yaml = buildExecutionYaml(cart, selectedRuntime);
    setGeneratedYaml(yaml);
    setShowYamlDialog(true);
  };

  const copyYamlToClipboard = () => {
    if (generatedYaml) {
      navigator.clipboard.writeText(generatedYaml);
    }
  };

  const downloadYaml = () => {
    if (!generatedYaml) {
      return;
    }

    const blob = new Blob([generatedYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = createExecutionFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    isLoading,
    loadError,
    actionError,
    loadExecutionData,
    tests,
    cart,
    filteredTests,
    filteredCart,
    paginatedTests,
    paginatedCart,
    searchTerm,
    filterConfigs,
    clearFilters,
    selectedTests,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectTest,
    addToCart,
    addSelectedToCart,
    showCsvDialog,
    setShowCsvDialog,
    csvInput,
    setCsvInput,
    handleCsvImport,
    totalPages,
    currentPage,
    setCurrentPage,
    pageNumbers: getPaginationPages(currentPage, totalPages),
    startIndex,
    endIndex,
    selectAllPages,
    setSelectAllPages,
    selectAllTests,
    cartTotalPages,
    cartCurrentPage,
    setCartCurrentPage,
    cartPageNumbers: getPaginationPages(cartCurrentPage, cartTotalPages),
    cartStartIndex,
    cartEndIndex,
    cartSearchFilter,
    setCartSearchFilter,
    handleRemoveFiltered,
    removeFromCart,
    clearCart,
    selectedRuntime,
    setSelectedRuntime,
    assignTestData,
    handleExportYaml,
    assignedTestDataCount: cart.filter(item => item.assignedTestData).length,
    showValidationModal,
    setShowValidationModal,
    showYamlDialog,
    setShowYamlDialog,
    generatedYaml,
    copyYamlToClipboard,
    downloadYaml,
    setSearchTerm,
  };
};
