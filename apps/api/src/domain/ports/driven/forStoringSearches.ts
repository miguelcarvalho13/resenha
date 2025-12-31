import type { Search } from '@api/domain/entities/searches';

export type ForStoringSearchesDrivenPort = {
  findAll: (args: {
    where: Partial<Pick<Search, 'deletedAt' | 'createdBy'>>;
  }) => Promise<Search[]>;

  findOne: (args: Pick<Search, 'id'>) => Promise<Search | null>;

  create: (
    data: Omit<Search, 'content' | 'createdBy' | 'updatedBy'>,
  ) => Promise<Search>;

  edit: (
    data: Partial<Pick<Search, 'content' | 'favorited' | 'name'>> &
      Pick<Search, 'updatedBy'>,
  ) => Promise<Search>;

  hardDelete: (ids: Search['id'][]) => Promise<Search[]>;

  softDelete: (
    ids: Search['id'][],
    updatedBy: Search['updatedBy'],
  ) => Promise<Search[]>;

  undoDelete: (
    ids: Search['id'][],
    updatedBy: Search['updatedBy'],
  ) => Promise<Search[]>;
};
