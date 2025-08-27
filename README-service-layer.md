# Service Layer Architecture

https://javierhbr.github.io/test-inventory/

This document explains the service layer implementation that separates business logic from UI components.

## Architecture Overview

The service layer follows these principles:

- **Separation of Concerns**: Business logic is separated from UI components
- **Reusability**: Services can be used across multiple components
- **Testability**: Business logic can be tested independently
- **Maintainability**: Changes to business logic don't affect UI components

## Directory Structure

```
/services/
├── types.ts              # Shared TypeScript interfaces
├── utils.ts              # Utility functions
├── authService.ts         # Authentication logic
├── testsService.ts        # Tests management logic
├── testDataService.ts     # Test data management logic
├── executionService.ts    # Execution builder logic
└── index.ts              # Main export file

/hooks/
├── useExecutionBuilder.ts # Custom hook for ExecutionBuilder
├── useTestsInventory.ts   # Custom hook for TestsInventory
├── useTestDataInventory.ts # Custom hook for TestDataInventory
└── index.ts              # Hooks export file

/examples/
└── ExecutionBuilderRefactored.tsx # Example of refactored component
```

## Services

### 1. Types (`/services/types.ts`)

Contains all shared TypeScript interfaces and types used across the application:

- `User`, `UserProfile`
- `Test`, `TestData`
- `CartItem`, `AssignedTestData`
- `CreateTestFormData`, `CreateTestDataFormData`
- `FilterOptions`, `ExecutionConfig`

### 2. Utils (`/services/utils.ts`)

Common utility functions:

- `generateId()` - Generate unique IDs
- `formatDate()`, `formatDateTime()` - Date formatting
- `filterItems()` - Generic filtering logic
- `downloadFile()`, `copyToClipboard()` - File operations
- `validateRequiredFields()` - Form validation

### 3. Auth Service (`/services/authService.ts`)

Handles authentication and authorization:

- `authenticateUser()` - User authentication
- `getAvailableProfiles()` - Get user profiles
- `getProfileInfo()` - Get profile details
- `hasPermission()` - Check user permissions
- `getAvailableTabs()` - Get accessible tabs

### 4. Tests Service (`/services/testsService.ts`)

Manages test cases:

- `getAllTests()` - Fetch all tests
- `getTestById()` - Fetch single test
- `filterTests()` - Filter tests by criteria
- `createTest()`, `updateTest()`, `deleteTest()` - CRUD operations
- `exportTestsToYaml()` - Export functionality
- `getTestStatistics()` - Analytics

### 5. Test Data Service (`/services/testDataService.ts`)

Manages test data:

- `getAllTestData()` - Fetch all test data
- `filterTestData()` - Filter test data
- `createTestData()` - Create new test data
- `updateTestDataStatus()` - Update status
- `findAvailableTestData()` - Find available data for requirements
- `exportTestDataToYaml()` - Export functionality

### 6. Execution Service (`/services/executionService.ts`)

Handles execution builder logic:

- `filterTestsForExecution()` - Filter tests for cart
- `addTestToCart()`, `removeTestFromCart()` - Cart management
- `assignTestDataToCart()` - Auto-assign test data
- `generateExecutionYaml()` - Generate YAML output
- `validateExecutionConfig()` - Validate execution setup

## Custom Hooks

Custom hooks encapsulate component state and business logic:

### useExecutionBuilder

```typescript
const {
  // State
  tests,
  cart,
  filteredTests,
  isLoading,
  error,

  // Actions
  handleAddToCart,
  handleRemoveFromCart,
  handleClearCart,
  handleAssignTestData,
  handleExportYaml,

  // Filters
  setSearchTerm,
  setFilterFlujo,
  clearFilters,
} = useExecutionBuilder();
```

### useTestsInventory

```typescript
const {
  // State
  tests,
  filteredTests,
  statistics,
  filterOptions,

  // Actions
  handleCreateTest,
  handleDeleteTest,
  handleExportYaml,

  // Filters
  searchTerm,
  setSearchTerm,
  clearFilters,
} = useTestsInventory();
```

## Usage Example

### Before (Component with Business Logic)

```typescript
export function ExecutionBuilder() {
  const [tests, setTests] = useState([]);
  const [cart, setCart] = useState([]);

  const addToCart = (test) => {
    // Business logic mixed with component
    setCart([...cart, { test }]);
  };

  const generateYaml = () => {
    // Complex business logic in component
    const yaml = `executionId: ${generateId()}...`;
    return yaml;
  };

  // Lots of business logic...

  return (
    <div>
      {/* UI rendering */}
    </div>
  );
}
```

### After (Component with Service Layer)

```typescript
export function ExecutionBuilder() {
  // All business logic moved to custom hook
  const {
    tests, cart, filteredTests,
    handleAddToCart, handleGenerateYaml,
    setSearchTerm, clearFilters
  } = useExecutionBuilder();

  // Component only handles UI rendering
  return (
    <div>
      {/* Clean UI rendering */}
    </div>
  );
}
```

## Benefits

1. **Cleaner Components**: Components focus only on UI rendering
2. **Reusable Logic**: Services can be used in multiple components
3. **Easier Testing**: Business logic can be tested independently
4. **Better Organization**: Related functionality is grouped together
5. **Type Safety**: Strong TypeScript typing throughout
6. **Consistent Patterns**: Similar patterns across all services

## Migration Strategy

To migrate existing components:

1. **Identify Business Logic**: Find data management, API calls, and calculations
2. **Create Service Functions**: Move business logic to appropriate service files
3. **Create Custom Hook**: Encapsulate component state and service calls
4. **Update Component**: Replace business logic with hook usage
5. **Add Error Handling**: Implement proper error handling in services
6. **Add Loading States**: Handle loading states in hooks

## Testing

Services can be tested independently:

```typescript
// Test service function
import { filterTests } from '../services/testsService';

test('should filter tests by flujo', () => {
  const tests = [
    /* test data */
  ];
  const filtered = filterTests(tests, { flujo: 'Pago' });
  expect(filtered).toHaveLength(1);
});
```

## Future Enhancements

- Add caching layer for better performance
- Implement real API integration
- Add optimistic updates
- Implement offline support
- Add data synchronization
