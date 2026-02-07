import { UserBadge } from './UserBadge';

export interface Badge {
  id?: string;
  name: string;

  users?: UserBadge[];
}