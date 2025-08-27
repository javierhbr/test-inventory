// Utility functions for the application

import { FilterOptions } from './types';

/**
 * Generates a unique ID with a prefix
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.floor(Math.random() * 90000) + 10000}`;
}

/**
 * Formats a date string to a more readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

/**
 * Formats a date string to a more readable format with time
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

/**
 * Checks if a string matches a search term (case insensitive)
 */
export function matchesSearch(text: string, searchTerm: string): boolean {
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Filters an array of items based on search criteria
 */
export function filterItems<T>(
  items: T[],
  filters: FilterOptions,
  searchFields: (keyof T)[]
): T[] {
  return items.filter(item => {
    // Check search term against specified fields
    if (filters.searchTerm) {
      const searchMatch = searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return matchesSearch(value, filters.searchTerm);
        }
        return false;
      });
      if (!searchMatch) return false;
    }

    // Check other filters
    for (const [key, value] of Object.entries(filters)) {
      if (key === 'searchTerm') continue;

      if (value === 'all' || !value) continue;

      const itemValue = item[key as keyof T];
      if (Array.isArray(value)) {
        // Handle array filters (e.g., multiple selections)
        if (!value.some(v => itemValue === v)) return false;
      } else {
        // Handle single value filters
        if (itemValue !== value) return false;
      }
    }

    return true;
  });
}

/**
 * Downloads a file with the given content and filename
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Generates a random date within a range
 */
export function generateRandomDate(daysBack: number = 30): string {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const randomDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return randomDate.toISOString();
}

/**
 * Validates if all required fields in an object are filled
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = obj[field];
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missingFields.push(String(field));
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Gets the appropriate CSS class for grid columns based on count
 */
export function getGridColsClass(count: number): string {
  switch (count) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-2';
    case 3:
      return 'grid-cols-3';
    case 4:
      return 'grid-cols-4';
    case 5:
      return 'grid-cols-5';
    case 6:
      return 'grid-cols-6';
    default:
      return 'grid-cols-3';
  }
}
