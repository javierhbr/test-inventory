import { useEffect } from 'react';

import { ExecutionCartPanel } from './execution-builder/ExecutionCartPanel';
import { ExecutionConfigurationCard } from './execution-builder/ExecutionConfigurationCard';
import { ExecutionDialogs } from './execution-builder/ExecutionDialogs';
import { ExecutionTestsPanel } from './execution-builder/ExecutionTestsPanel';
import { useExecutionBuilderViewModel } from './execution-builder/useExecutionBuilderViewModel';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function ExecutionBuilder() {
  const vm = useExecutionBuilderViewModel();

  useEffect(() => {
    void vm.loadExecutionData();
  }, [vm.loadExecutionData]);

  if (vm.isLoading && vm.tests.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border bg-white">
        <div className="text-sm text-gray-600">Loading execution data...</div>
      </div>
    );
  }

  return (
    <>
      {(vm.loadError || vm.actionError) && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between py-3">
            <p className="text-sm text-red-700">
              {vm.loadError || vm.actionError}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void vm.loadExecutionData()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid h-[calc(100vh-200px)] grid-cols-12 gap-6">
        <ExecutionTestsPanel
          searchTerm={vm.searchTerm}
          setSearchTerm={vm.setSearchTerm}
          filterConfigs={vm.filterConfigs}
          clearFilters={vm.clearFilters}
          filteredTests={vm.filteredTests}
          tests={vm.tests}
          selectedCount={vm.selectedCount}
          isAllSelected={vm.isAllSelected}
          isIndeterminate={vm.isIndeterminate}
          handleSelectAll={vm.handleSelectAll}
          showCsvDialog={vm.showCsvDialog}
          setShowCsvDialog={vm.setShowCsvDialog}
          csvInput={vm.csvInput}
          setCsvInput={vm.setCsvInput}
          handleCsvImport={vm.handleCsvImport}
          selectedTests={vm.selectedTests}
          addSelectedToCart={vm.addSelectedToCart}
          paginatedTests={vm.paginatedTests}
          handleSelectTest={vm.handleSelectTest}
          addToCart={vm.addToCart}
          totalPages={vm.totalPages}
          startIndex={vm.startIndex}
          endIndex={vm.endIndex}
          selectAllPages={vm.selectAllPages}
          setSelectAllPages={vm.setSelectAllPages}
          selectAllTests={vm.selectAllTests}
          currentPage={vm.currentPage}
          setCurrentPage={vm.setCurrentPage}
          pageNumbers={vm.pageNumbers}
        />

        <div className="col-span-7 space-y-4">
          <ExecutionCartPanel
            cart={vm.cart}
            clearCart={vm.clearCart}
            cartSearchFilter={vm.cartSearchFilter}
            setCartSearchFilter={vm.setCartSearchFilter}
            cartStartIndex={vm.cartStartIndex}
            cartEndIndex={vm.cartEndIndex}
            filteredCart={vm.filteredCart}
            handleRemoveFiltered={vm.handleRemoveFiltered}
            paginatedCart={vm.paginatedCart}
            removeFromCart={vm.removeFromCart}
            cartTotalPages={vm.cartTotalPages}
            cartCurrentPage={vm.cartCurrentPage}
            setCartCurrentPage={vm.setCartCurrentPage}
            cartPageNumbers={vm.cartPageNumbers}
          />

          <ExecutionConfigurationCard
            selectedRuntime={vm.selectedRuntime}
            setSelectedRuntime={vm.setSelectedRuntime}
            assignTestData={vm.assignTestData}
            handleExportYaml={vm.handleExportYaml}
            cart={vm.cart}
            assignedTestDataCount={vm.assignedTestDataCount}
          />
        </div>
      </div>

      <ExecutionDialogs
        showValidationModal={vm.showValidationModal}
        setShowValidationModal={vm.setShowValidationModal}
        showYamlDialog={vm.showYamlDialog}
        setShowYamlDialog={vm.setShowYamlDialog}
        copyYamlToClipboard={vm.copyYamlToClipboard}
        downloadYaml={vm.downloadYaml}
        generatedYaml={vm.generatedYaml}
      />
    </>
  );
}
