import { UserBadge } from './UserBadge.ts';

export interface Badge {
  id?: string;
  name: string;

  users?: UserBadge[];
}