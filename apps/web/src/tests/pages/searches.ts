import { page, type Locator } from '@vitest/browser/context';
import { expect } from 'vitest';

export const createFilterRowPO = ({ row }: { row: Locator }) => {
  const tagInput = row.getByLabelText('Tag');
  const tagInputDropdown = page.getByRole('listbox', { name: 'List of tags' });
  const tagInputDropdownOptions = tagInputDropdown.getByRole('option');
  const operatorInput = row.getByLabelText('Operator');
  const operatorInputDropdown = page.getByRole('listbox', { name: 'Operator' });
  const operatorInputOptions = operatorInputDropdown.getByRole('option');
  const valueInput = row.getByLabelText('Value');
  const valueInputDropdown = page.getByRole('listbox', { name: 'Value' });
  const valueInputOptions = valueInputDropdown.getByRole('option');

  return {
    tagInput,
    tagInputDropdown,
    tagInputDropdownOptions,
    operatorInput,
    operatorInputDropdown,
    operatorInputOptions,
    valueInput,
    valueInputDropdown,
    valueInputOptions,
  };
};

export const createSearchesPO = () => {
  const searchNotesButton = page.getByRole('button', { name: /Search notes/ });
  const searches = page.getByTestId('search-card');
  const modal = page.getByRole('dialog', { name: /Search notes/ });
  const modalFiltersContainer = modal.getByTestId('tags-filter-container');

  const searchModal = {
    addTagButton: modal.getByRole('button', { name: /Add tag/ }),
    clearSearchButton: modal.getByRole('button', { name: /Clear search/ }),
    dialog: modal,
    filterRows: modalFiltersContainer.getByTestId('tags-filter'),
    modalFiltersContainer,
    searchButton: modal.getByRole('button', { name: /Search/ }),

    // methods
    expectToBeVisible: () => expect.element(modal).toBeVisible(),
    expectNotToBeVisible: () => expect.element(modal).not.toBeInTheDocument(),
  };

  const deleteModalIt = page.getByRole('dialog', {
    name: /Delete search\?/,
  });

  const deleteModal = {
    it: deleteModalIt,

    cancelButton: deleteModalIt.getByRole('button', { name: /Cancel/ }),
    confirmButton: deleteModalIt.getByRole('button', { name: /Confirm/ }),
    title: deleteModalIt.getByRole('heading'),

    // methods
    expectToBeVisible: () => expect.element(deleteModalIt).toBeVisible(),
    expectNotToBeVisible: () =>
      expect.element(deleteModalIt).not.toBeInTheDocument(),
  };

  const searchDeleteButton = (searchCard: Locator) =>
    searchCard.getByRole('button', { name: /Delete search/ });
  const searchNameButton = (searchCard: Locator) =>
    searchCard.getByLabelText('Search name');
  const searchFavoriteButton = (searchCard: Locator) =>
    searchCard.getByRole('button', { name: /Favorite search/ });

  return {
    searches,
    searchModal,
    searchNotesButton,
    deleteModal,

    // methods
    searchDeleteButton,
    searchNameButton,
    searchFavoriteButton,
  };
};
