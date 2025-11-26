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

  return {
    searchModal,
    searchNotesButton,
  };
};
