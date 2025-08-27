// Custom hook for TestsInventory logic using service layer

import { useState, useEffect, useCallback } from 'react';

import {
  Test,
  getAllTests,
  filterTests,
  createTest,
  deleteTest,
  getFilterOptions,
  exportTestsToYaml,
  getTestStatistics,
  downloadFile,
  CreateTestFormData,
} from '../services';

interface UseTestsInventoryReturn {
  // State
  tests: Test[];
  filteredTests: Test[];
  isLoading: boolean;
  error: string | null;
  selectedTest: Test | null;
  filterOptions: {
    flujos: string[];
    statuses: string[];
    runtimes: string[];
  };
  statistics: ReturnType<typeof getTestStatistics>;

  // Filters
  searchTerm: string;
  filterFlujo: string;
  filterStatus: string;
  filterRuntime: string;

  // Actions
  setSearchTerm: (term: string) => void;
  setFilterFlujo: (flujo: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterRuntime: (runtime: string) => void;
  setSelectedTest: (test: Test | null) => void;

  // Business logic
  handleCreateTest: (testData: CreateTestFormData) => Promise<void>;
  handleDeleteTest: (testId: string) => Promise<void>;
  handleExportYaml: () => void;
  clearFilters: () => void;
  refreshTests: () => Promise<void>;
}

export function useTestsInventory(): UseTestsInventoryReturn {
  // State
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlujo, setFilterFlujo] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRuntime, setFilterRuntime] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tests on component mount
  const loadTests = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  // Filter tests based on current filters
  const filteredTests = filterTests(tests, {
    searchTerm,
    flujo: filterFlujo,
    status: filterStatus,
    runtime: filterRuntime,
  });

  // Get filter options
  const filterOptions = getFilterOptions();

  // Get statistics
  const statistics = getTestStatistics(filteredTests);

  // Business logic handlers
  const handleCreateTest = useCallback(async (testData: CreateTestFormData) => {
    setIsLoading(true);
    try {
      const newTest = await createTest(testData);
      setTests(prevTests => [...prevTests, newTest]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating test');
      throw err; // Re-throw to allow component to handle UI feedback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteTest = useCallback(
    async (testId: string) => {
      setIsLoading(true);
      try {
        await deleteTest(testId);
        setTests(prevTests => prevTests.filter(test => test.id !== testId));
        if (selectedTest?.id === testId) {
          setSelectedTest(null);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error deleting test');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTest]
  );

  const handleExportYaml = useCallback(() => {
    try {
      const yaml = exportTestsToYaml(filteredTests);
      const filename = `tests-export-${new Date().toISOString().slice(0, 10)}.yaml`;
      downloadFile(yaml, filename, 'text/yaml');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error exporting tests');
    }
  }, [filteredTests]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterFlujo('all');
    setFilterStatus('all');
    setFilterRuntime('all');
  }, []);

  const refreshTests = useCallback(async () => {
    await loadTests();
  }, [loadTests]);

  return {
    // State
    tests,
    filteredTests,
    isLoading,
    error,
    selectedTest,
    filterOptions,
    statistics,

    // Filters
    searchTerm,
    filterFlujo,
    filterStatus,
    filterRuntime,

    // Setters
    setSearchTerm,
    setFilterFlujo,
    setFilterStatus,
    setFilterRuntime,
    setSelectedTest,

    // Business logic
    handleCreateTest,
    handleDeleteTest,
    handleExportYaml,
    clearFilters,
    refreshTests,
  };
}
