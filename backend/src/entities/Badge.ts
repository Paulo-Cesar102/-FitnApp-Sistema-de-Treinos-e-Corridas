import { UserBadge } from './UserBadge.js';

export interface Badge {
  id?: string;
  name: string;

  users?: UserBadge[];
} 