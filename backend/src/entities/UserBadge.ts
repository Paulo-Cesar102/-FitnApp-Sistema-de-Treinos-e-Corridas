import { IUser } from './User';
import { Badge } from './Badge';

export interface UserBadge {
  id?: string;
  userId: string;
  badgeId: string;
  earnedAt?: Date;

  user?: IUser;
  badge?: Badge;
}