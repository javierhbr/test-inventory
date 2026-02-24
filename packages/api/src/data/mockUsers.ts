import { User } from '../types/domain';

export const mockUsers: User[] = [
  { id: 'dev-001', name: 'John Doe', profile: 'dev' },
  { id: 'automation-001', name: 'Mary Garcia', profile: 'automation' },
  { id: 'product-001', name: 'Charles Lopez', profile: 'product' },
  { id: 'admin-001', name: 'Ana Martinez', profile: 'admin' },
  { id: 'qa-001', name: 'Laura Ruiz', profile: 'qa_engineer' },
];

export const availableProfiles = mockUsers.map(user => user.profile);
