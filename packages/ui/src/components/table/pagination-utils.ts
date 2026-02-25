export type PaginationPage = number | 'ellipsis';

export const getPageNumbers = (
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
