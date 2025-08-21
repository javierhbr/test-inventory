// Custom hook for ExecutionBuilder logic using service layer

import { useState, useEffect, useCallback } from 'react';
import {
  Test,
  CartItem,
  FilterOptions,
  getAllTests,
  filterTestsForExecution,
  addTestToCart,
  removeTestFromCart,
  clearExecutionCart,
  assignTestDataToCart,
  generateExecutionYaml,
  downloadExecutionYaml,
  copyExecutionYamlToClipboard,
  validateExecutionConfig,
  importTestsFromCsv
} from '../services';

interface UseExecutionBuilderReturn {
  // State
  tests: Test[];
  cart: CartItem[];
  filteredTests: Test[];
  isLoading: boolean;
  error: string | null;
  showValidationModal: boolean;
  showYamlDialog: boolean;
  showCsvDialog: boolean;
  csvInput: string;
  selectedRuntime: string;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setFilterFlujo: (flujo: string) => void;
  setFilterRuntime: (runtime: string) => void;
  setSelectedRuntime: (runtime: string) => void;
  setCsvInput: (input: string) => void;
  setShowCsvDialog: (show: boolean) => void;
  setShowYamlDialog: (show: boolean) => void;
  setShowValidationModal: (show: boolean) => void;
  
  // Business logic
  handleAddToCart: (test: Test) => void;
  handleRemoveFromCart: (testId: string) => void;
  handleClearCart: () => void;
  handleAssignTestData: () => Promise<void>;
  handleCsvImport: () => Promise<void>;
  handleExportYaml: () => void;
  handleDownloadYaml: () => Promise<void>;
  handleCopyYaml: () => Promise<void>;
  clearFilters: () => void;
}

export function useExecutionBuilder(): UseExecutionBuilderReturn {
  // State
  const [tests, setTests] = useState<Test[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlujo, setFilterFlujo] = useState('all');
  const [filterRuntime, setFilterRuntime] = useState('all');
  const [selectedRuntime, setSelectedRuntime] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showYamlDialog, setShowYamlDialog] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);

  // Load tests on component mount
  useEffect(() => {
    const loadTests = async () => {
      setIsLoading(true);
      try {
        const testsData = await getAllTests();
        setTests(testsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading tests');
      } finally {
        setIsLoading(false);
      }
    };

    loadTests();
  }, []);

  // Filter tests based on current filters and cart
  const filteredTests = filterTestsForExecution(tests, cart, {
    searchTerm,
    flujo: filterFlujo,
    runtime: filterRuntime
  });

  // Business logic handlers
  const handleAddToCart = useCallback((test: Test) => {
    try {
      const newCart = addTestToCart(test, cart);
      setCart(newCart);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding test to cart');
    }
  }, [cart]);

  const handleRemoveFromCart = useCallback((testId: string) => {
    const newCart = removeTestFromCart(testId, cart);
    setCart(newCart);
  }, [cart]);

  const handleClearCart = useCallback(() => {
    setCart(clearExecutionCart());
  }, []);

  const handleAssignTestData = useCallback(async () => {
    if (cart.length === 0) return;
    
    setIsLoading(true);
    try {
      const updatedCart = await assignTestDataToCart(cart);
      setCart(updatedCart);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error assigning test data');
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const handleCsvImport = useCallback(async () => {
    if (!csvInput.trim()) {
      setError('Please enter CSV content');
      return;
    }

    setIsLoading(true);
    try {
      const importedTests = await importTestsFromCsv(csvInput, tests);
      const newCart = [...cart, ...importedTests];
      setCart(newCart);
      setCsvInput('');
      setShowCsvDialog(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error importing CSV');
    } finally {
      setIsLoading(false);
    }
  }, [csvInput, tests, cart]);

  const handleExportYaml = useCallback(() => {
    const validation = validateExecutionConfig(cart, selectedRuntime);
    if (!validation.isValid) {
      setShowValidationModal(true);
      return;
    }
    setShowYamlDialog(true);
  }, [cart, selectedRuntime]);

  const handleDownloadYaml = useCallback(async () => {
    try {
      await downloadExecutionYaml({ cart, selectedRuntime });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error downloading YAML');
    }
  }, [cart, selectedRuntime]);

  const handleCopyYaml = useCallback(async () => {
    try {
      const success = await copyExecutionYamlToClipboard({ cart, selectedRuntime });
      if (!success) {
        setError('Failed to copy to clipboard');
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error copying YAML');
    }
  }, [cart, selectedRuntime]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterFlujo('all');
    setFilterRuntime('all');
  }, []);

  return {
    // State
    tests,
    cart,
    filteredTests,
    isLoading,
    error,
    showValidationModal,
    showYamlDialog,
    showCsvDialog,
    csvInput,
    selectedRuntime,
    
    // Setters
    setSearchTerm,
    setFilterFlujo,
    setFilterRuntime,
    setSelectedRuntime,
    setCsvInput,
    setShowCsvDialog,
    setShowYamlDialog,
    setShowValidationModal,
    
    // Business logic
    handleAddToCart,
    handleRemoveFromCart,
    handleClearCart,
    handleAssignTestData,
    handleCsvImport,
    handleExportYaml,
    handleDownloadYaml,
    handleCopyYaml,
    clearFilters
  };
}