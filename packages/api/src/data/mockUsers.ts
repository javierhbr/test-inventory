import { User } from '../types/domain';

export const mockUsers: User[] = [
  { id: 'dev-001', name: 'John Doe', profile: 'dev', lob: 'BANK' },
  {
    id: 'automation-001',
    name: 'Mary Garcia',
    profile: 'automation',
    lob: 'CARD',
  },
  { id: 'product-001', name: 'Charles Lopez', profile: 'product', lob: 'FS' },
  { id: 'admin-001', name: 'Ana Martinez', profile: 'admin', lob: 'BANK' },
  { id: 'qa-001', name: 'Laura Ruiz', profile: 'qa_engineer', lob: 'DFS' },
];

export const availableProfiles = mockUsers.map(user => user.profile);
