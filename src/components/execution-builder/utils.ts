import type { CartItem } from '../../services/types';

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

export type PaginationPage = number | 'ellipsis';

export const getPaginationPages = (
  currentPage: number,
  totalPages: number,
  maxVisiblePages = 5
): PaginationPage[] => {
  const pages: PaginationPage[] = [];

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  }

  if (currentPage <= 3) {
    for (let i = 1; i <= 4; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  }

  if (currentPage >= totalPages - 2) {
    pages.push(1);
    pages.push('ellipsis');
    for (let i = totalPages - 3; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);
  pages.push('ellipsis');
  pages.push(currentPage - 1);
  pages.push(currentPage);
  pages.push(currentPage + 1);
  pages.push('ellipsis');
  pages.push(totalPages);

  return pages;
};

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
