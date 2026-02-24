// Custom hook for TestDataInventory logic using service layer

import { useState, useEffect, useCallback } from 'react';

import { TestData, CreateTestDataFormData } from '../services/types';
import {
  getAllTestData,
  filterTestData,
  createTestData,
  updateTestDataStatus,
  deleteTestData,
  getTestDataFilterOptions,
  exportTestDataToYaml,
  getTestDataStatistics,
} from '../services/testDataService';
import { downloadFile } from '../services/utils';

interface UseTestDataInventoryReturn {
  // State
  testData: TestData[];
  filteredTestData: TestData[];
  isLoading: boolean;
  error: string | null;
  selectedTestData: TestData | null;
  filterOptions: {
    statuses: TestData['status'][];
    classifications: string[];
    sources: string[];
    environments: string[];
  };
  statistics: ReturnType<typeof getTestDataStatistics>;

  // Filters
  searchTerm: string;
  filterStatus: string;
  filterClassification: string;
  filterSource: string;
  filterEnvironment: string;

  // Actions
  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterClassification: (classification: string) => void;
  setFilterSource: (source: string) => void;
  setFilterEnvironment: (environment: string) => void;
  setSelectedTestData: (testData: TestData | null) => void;

  // Business logic
  handleCreateTestData: (formData: CreateTestDataFormData) => Promise<void>;
  handleUpdateStatus: (id: string, status: TestData['status']) => Promise<void>;
  handleDeleteTestData: (id: string) => Promise<void>;
  handleExportYaml: () => void;
  clearFilters: () => void;
  refreshTestData: () => Promise<void>;
}

export function useTestDataInventory(): UseTestDataInventoryReturn {
  // State
  const [testData, setTestData] = useState<TestData[]>([]);
  const [selectedTestData, setSelectedTestData] = useState<TestData | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClassification, setFilterClassification] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterEnvironment, setFilterEnvironment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load test data on component mount
  const loadTestData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllTestData();
      setTestData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading test data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestData();
  }, [loadTestData]);

  // Filter test data based on current filters
  const filteredTestData = filterTestData(testData, {
    searchTerm,
    status: filterStatus,
    classification: filterClassification,
    source: filterSource,
    environment: filterEnvironment,
  });

  // Get filter options
  const filterOptions = getTestDataFilterOptions();

  // Get statistics
  const statistics = getTestDataStatistics(filteredTestData);

  // Business logic handlers
  const handleCreateTestData = useCallback(
    async (formData: CreateTestDataFormData) => {
      setIsLoading(true);
      try {
        const newTestData = await createTestData(formData);
        setTestData(prevData => [...prevData, newTestData]);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error creating test data'
        );
        throw err; // Re-throw to allow component to handle UI feedback
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleUpdateStatus = useCallback(
    async (id: string, status: TestData['status']) => {
      setIsLoading(true);
      try {
        const updatedTestData = await updateTestDataStatus(id, status);
        setTestData(prevData =>
          prevData.map(item => (item.id === id ? updatedTestData : item))
        );
        if (selectedTestData?.id === id) {
          setSelectedTestData(updatedTestData);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error updating status');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTestData]
  );

  const handleDeleteTestData = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await deleteTestData(id);
        setTestData(prevData => prevData.filter(item => item.id !== id));
        if (selectedTestData?.id === id) {
          setSelectedTestData(null);
        }
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error deleting test data'
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTestData]
  );

  const handleExportYaml = useCallback(() => {
    try {
      const yaml = exportTestDataToYaml(filteredTestData);
      const filename = `test-data-export-${new Date().toISOString().slice(0, 10)}.yaml`;
      downloadFile(yaml, filename, 'text/yaml');
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error exporting test data'
      );
    }
  }, [filteredTestData]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterClassification('all');
    setFilterSource('all');
    setFilterEnvironment('all');
  }, []);

  const refreshTestData = useCallback(async () => {
    await loadTestData();
  }, [loadTestData]);

  return {
    // State
    testData,
    filteredTestData,
    isLoading,
    error,
    selectedTestData,
    filterOptions,
    statistics,

    // Filters
    searchTerm,
    filterStatus,
    filterClassification,
    filterSource,
    filterEnvironment,

    // Setters
    setSearchTerm,
    setFilterStatus,
    setFilterClassification,
    setFilterSource,
    setFilterEnvironment,
    setSelectedTestData,

    // Business logic
    handleCreateTestData,
    handleUpdateStatus,
    handleDeleteTestData,
    handleExportYaml,
    clearFilters,
    refreshTestData,
  };
}
