// Execution service - handles execution builder logic

import { findAvailableTestData } from './testDataService';
import {
  Test,
  CartItem,
  AssignedTestData,
  YamlGenerationOptions,
  FilterOptions,
} from './types';
import {
  generateId,
  downloadFile,
  copyToClipboard,
  filterItems,
} from './utils';

/**
 * Filters tests for execution builder (excludes tests already in cart)
 */
export function filterTestsForExecution(
  tests: Test[],
  cart: CartItem[],
  filters: FilterOptions
): Test[] {
  // First filter out tests already in cart
  const availableTests = tests.filter(
    test => !cart.some(item => item.test.id === test.id)
  );

  // Then apply other filters
  const searchFields: (keyof Test)[] = ['name', 'id'];

  return filterItems(availableTests, filters, searchFields).filter(test => {
    if (
      filters.flujo &&
      filters.flujo !== 'all' &&
      test.labels.flujo !== filters.flujo
    ) {
      return false;
    }

    if (filters.runtime && filters.runtime !== 'all') {
      const runtime = Array.isArray(filters.runtime) ? filters.runtime[0] : filters.runtime;
      return test.supportedRuntimes.includes(runtime);
    }

    return true;
  });
}

/**
 * Adds a test to the execution cart
 */
export function addTestToCart(test: Test, cart: CartItem[]): CartItem[] {
  // Check if test is already in cart
  if (cart.some(item => item.test.id === test.id)) {
    throw new Error('Test ya está en el carrito');
  }

  const newItem: CartItem = { test };
  return [...cart, newItem];
}

/**
 * Removes a test from the execution cart
 */
export function removeTestFromCart(
  testId: string,
  cart: CartItem[]
): CartItem[] {
  return cart.filter(item => item.test.id !== testId);
}

/**
 * Clears the entire execution cart
 */
export function clearExecutionCart(): CartItem[] {
  return [];
}

/**
 * Imports tests from CSV data
 */
export async function importTestsFromCsv(
  csvContent: string,
  availableTests: Test[]
): Promise<CartItem[]> {
  return new Promise((resolve, reject) => {
    try {
      const lines = csvContent.trim().split('\n');

      if (lines.length < 2) {
        reject(
          new Error('CSV debe tener al menos header y una línea de datos')
        );
        return;
      }

      const header = lines[0].toLowerCase();
      if (!header.includes('testid')) {
        reject(new Error('CSV debe tener una columna "testId"'));
        return;
      }

      const testIds = lines
        .slice(1)
        .map(line => line.trim())
        .filter(Boolean);

      const testsToAdd = availableTests.filter(test =>
        testIds.includes(test.id)
      );
      const cartItems = testsToAdd.map(test => ({ test }) as CartItem);

      if (cartItems.length === 0) {
        reject(new Error('No se encontraron tests válidos en el CSV'));
        return;
      }

      resolve(cartItems);
    } catch (error) {
      reject(new Error('Error procesando CSV: ' + (error as Error).message));
    }
  });
}

/**
 * Automatically assigns test data to cart items
 */
export async function assignTestDataToCart(
  cart: CartItem[]
): Promise<CartItem[]> {
  const updatedCart: CartItem[] = [];

  for (const item of cart) {
    if (item.assignedTestData) {
      // Already has test data assigned
      updatedCart.push(item);
      continue;
    }

    try {
      // Find available test data for this test's requirements
      const availableTestData = await findAvailableTestData(
        item.test.dataRequirements
      );

      if (availableTestData.length > 0) {
        // Use the first available test data
        const testData = availableTestData[0];
        const assignedTestData: AssignedTestData = {
          id: testData.id,
          accountId: testData.accountId,
          referenceId: testData.referenceId,
          customerId: testData.customerId,
          assignedAt: new Date().toISOString(),
          status: 'Asignado',
        };

        updatedCart.push({
          ...item,
          assignedTestData,
        });
      } else {
        // Create mock test data if none available
        const mockTestData: AssignedTestData = {
          id: generateId('TD'),
          accountId: generateId('ACC'),
          referenceId: generateId('REF-ACC'),
          customerId: generateId('CUST'),
          assignedAt: new Date().toISOString(),
          status: 'Asignado',
        };

        updatedCart.push({
          ...item,
          assignedTestData: mockTestData,
        });
      }
    } catch (error) {
      // If assignment fails, keep the item without test data
      updatedCart.push(item);
    }
  }

  return updatedCart;
}

/**
 * Validates execution configuration
 */
export function validateExecutionConfig(
  cart: CartItem[],
  selectedRuntime: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (cart.length === 0) {
    errors.push('Selecciona al menos un test para ejecutar');
  }

  if (!selectedRuntime) {
    errors.push('Selecciona un runtime de ejecución');
  }

  // Check if all tests support the selected runtime
  if (selectedRuntime) {
    const unsupportedTests = cart.filter(
      item => !item.test.supportedRuntimes.includes(selectedRuntime)
    );

    if (unsupportedTests.length > 0) {
      errors.push(
        `Los siguientes tests no soportan ${selectedRuntime}: ${unsupportedTests
          .map(item => item.test.id)
          .join(', ')}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generates execution YAML
 */
export function generateExecutionYaml(options: YamlGenerationOptions): string {
  const { cart, selectedRuntime } = options;

  // Validate configuration
  const validation = validateExecutionConfig(cart, selectedRuntime);
  if (!validation.isValid) {
    throw new Error(validation.errors.join('; '));
  }

  const executionId = `EX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
    Math.random() * 1000
  )
    .toString()
    .padStart(3, '0')}`;

  const yaml = `executionId: ${executionId}
createdAt: ${new Date().toISOString()}
runtime: ${selectedRuntime}
tests:
${cart
  .map(
    item => `  - id: ${item.test.id}
    name: ${item.test.name}
    goldenDialogId: GD-${item.test.id.slice(-3)}
    dialogGroupIdFile:
      bucket: my-test-dialogs
      path: golden-dialogs/${item.test.labels.flujo.toLowerCase()}-flow/dialog-${item.test.id.slice(-3)}.yaml
    dataRequirements:
${item.test.dataRequirements.map(req => `      - ${req}`).join('\n')}${
      item.assignedTestData
        ? `
    testData:
      id: ${item.assignedTestData.id}
      accountId: ${item.assignedTestData.accountId}
      referenceId: ${item.assignedTestData.referenceId}
      customerId: ${item.assignedTestData.customerId}
      assignedAt: ${item.assignedTestData.assignedAt}
      status: ${item.assignedTestData.status}`
        : ''
    }`
  )
  .join('\n')}`;

  return yaml;
}

/**
 * Downloads execution YAML file
 */
export async function downloadExecutionYaml(
  options: YamlGenerationOptions
): Promise<void> {
  try {
    const yaml = generateExecutionYaml(options);
    const executionId = `EX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, '0')}`;

    downloadFile(yaml, `${executionId}.yaml`, 'text/yaml');
  } catch (error) {
    throw new Error('Error generando YAML: ' + (error as Error).message);
  }
}

/**
 * Copies execution YAML to clipboard
 */
export async function copyExecutionYamlToClipboard(
  options: YamlGenerationOptions
): Promise<boolean> {
  try {
    const yaml = generateExecutionYaml(options);
    return await copyToClipboard(yaml);
  } catch (error) {
    console.error('Error copying YAML to clipboard:', error);
    return false;
  }
}

/**
 * Gets execution statistics
 */
export function getExecutionStatistics(cart: CartItem[]): {
  totalTests: number;
  testsWithData: number;
  testsWithoutData: number;
  byRuntime: Record<string, number>;
  byFlujo: Record<string, number>;
} {
  const stats = {
    totalTests: cart.length,
    testsWithData: cart.filter(item => item.assignedTestData).length,
    testsWithoutData: cart.filter(item => !item.assignedTestData).length,
    byRuntime: {} as Record<string, number>,
    byFlujo: {} as Record<string, number>,
  };

  cart.forEach(item => {
    // Runtime stats
    item.test.supportedRuntimes.forEach(runtime => {
      stats.byRuntime[runtime] = (stats.byRuntime[runtime] || 0) + 1;
    });

    // Flujo stats
    const flujo = item.test.labels.flujo;
    stats.byFlujo[flujo] = (stats.byFlujo[flujo] || 0) + 1;
  });

  return stats;
}

/**
 * Gets available runtimes from cart
 */
export function getAvailableRuntimes(cart: CartItem[]): string[] {
  const runtimes = new Set<string>();

  cart.forEach(item => {
    item.test.supportedRuntimes.forEach(runtime => {
      runtimes.add(runtime);
    });
  });

  return Array.from(runtimes);
}

/**
 * Gets tests that support a specific runtime
 */
export function getTestsForRuntime(
  cart: CartItem[],
  runtime: string
): CartItem[] {
  return cart.filter(item => item.test.supportedRuntimes.includes(runtime));
}

/**
 * Estimates execution time based on cart
 */
export function estimateExecutionTime(cart: CartItem[]): {
  estimatedMinutes: number;
  breakdown: Record<string, number>;
} {
  // Mock estimation logic - in real app this would be more sophisticated
  const baseTimePerTest = 5; // minutes
  const complexityMultipliers = {
    Pago: 1.5,
    Login: 1.0,
    Transferencia: 2.0,
    Consulta: 1.2,
    Activación: 1.8,
  };

  let totalMinutes = 0;
  const breakdown: Record<string, number> = {};

  cart.forEach(item => {
    const flujo = item.test.labels.flujo;
    const multiplier =
      complexityMultipliers[flujo as keyof typeof complexityMultipliers] || 1.0;
    const testTime = baseTimePerTest * multiplier;

    totalMinutes += testTime;
    breakdown[flujo] = (breakdown[flujo] || 0) + testTime;
  });

  return {
    estimatedMinutes: Math.round(totalMinutes),
    breakdown,
  };
}

/**
 * Validates test data assignment
 */
export function validateTestDataAssignment(cart: CartItem[]): {
  isValid: boolean;
  issues: Array<{ testId: string; issue: string }>;
} {
  const issues: Array<{ testId: string; issue: string }> = [];

  cart.forEach(item => {
    if (!item.assignedTestData) {
      issues.push({
        testId: item.test.id,
        issue: 'No tiene test data asignado',
      });
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
}
