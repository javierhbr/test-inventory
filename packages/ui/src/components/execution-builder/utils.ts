import type { CartItem } from '../../services/types';

export { getPageNumbers as getPaginationPages } from '../table';
export type { PaginationPage } from '../table';

export const ITEMS_PER_PAGE = 10;

export const FLOW_OPTIONS = [
  'Payment',
  'Login',
  'Transfer',
  'Inquiry',
  'Activation',
] as const;

export const RUNTIME_OPTIONS = [
  'OCP Testing Studio',
  'Xero',
  'Sierra',
] as const;

const createExecutionId = () =>
  `EX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
    Math.random() * 1000
  )
    .toString()
    .padStart(3, '0')}`;

export const createExecutionFilename = () => `${createExecutionId()}.yaml`;

export const buildExecutionYaml = (
  cart: CartItem[],
  selectedRuntime: string
): string => {
  const executionId = createExecutionId();

  return `executionId: ${executionId}
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
      path: golden-dialogs/${item.test.labels.flow.toLowerCase()}-flow/dialog-${item.test.id.slice(-3)}.yaml
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
};
