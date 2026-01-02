import type { DrivenContext } from '@api/domain/context';
import type { Search } from '@api/domain/entities/searches';
import type { Session } from '@api/domain/entities/session';

export type ForSearchesDriverPort = (
  ctx: Pick<DrivenContext, 'forStoringSearches'>,
) => {
  findAll: (session: Session) => Promise<Search[]>;

  findOne: (id: Search['id'], session: Session) => Promise<Search | null>;

  create: (data: Pick<Search, 'content'>, session: Session) => Promise<Search>;

  edit: (
    data: Pick<Search, 'id'> &
      Partial<Pick<Search, 'content' | 'favorited' | 'name'>>,
    session: Session,
  ) => Promise<Search>;

  hardDelete: (ids: Search['id'][], session: Session) => Promise<Search[]>;

  softDelete: (ids: Search['id'][], session: Session) => Promise<Search[]>;

  undoDelete: (ids: Search['id'][], session: Session) => Promise<Search[]>;
};
