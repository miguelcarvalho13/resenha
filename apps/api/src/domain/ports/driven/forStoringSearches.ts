import type { Search } from '@api/domain/entities/searches';

export type ForStoringSearchesDrivenPort = {
  findAll: (args: {
    where: Partial<Pick<Search, 'deletedAt' | 'createdBy'>> & {
      ids?: Search['id'][];
    };
  }) => Promise<Search[]>;

  findOne: (args: Pick<Search, 'id'>) => Promise<Search | null>;

  create: (
    data: Pick<Search, 'content' | 'createdBy' | 'updatedBy'>,
  ) => Promise<Search>;

  edit: (
    data: Partial<Pick<Search, 'content' | 'favorited' | 'name'>> &
      Pick<Search, 'id' | 'updatedBy'>,
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
