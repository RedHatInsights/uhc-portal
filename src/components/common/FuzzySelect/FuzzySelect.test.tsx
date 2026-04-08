import React from 'react';

import { checkAccessibility, render, screen, waitFor } from '~/testUtils';

import { FuzzySelect, FuzzySelectProps } from './FuzzySelect';

const selectionData = [
  { entryId: 'x-110', label: 'I am different', disabled: false },
  { entryId: 'item-211', label: 'B - label for id-2', disabled: false },
  { entryId: 'item-111', label: 'A - label for id-1', disabled: false },
  { entryId: 'item-333', label: 'C - label for id-3', disabled: false },
];

const defaultProps: FuzzySelectProps = {
  selectionData,
  isOpen: true,
  isDisabled: false,
  onOpenChange: () => null,
  placeholderText: 'Fuzzy Select placeholder',
  inlineFilterPlaceholderText: 'Filter by name or ID',
  'aria-describedby': 'for-accessibility',
};

describe('FuzzySelect', () => {
  describe('when it is closed', () => {
    it('is accessible', async () => {
      // render dropdown
      const { container } = render(<FuzzySelect {...defaultProps} isOpen={false} />);

      // Assert
      await checkAccessibility(container);
    });
  });

  describe('when it is open', () => {
    it('is accessible', async () => {
      // render dropdown
      const { container } = render(<FuzzySelect {...defaultProps} />);

      // Assert
      await checkAccessibility(container);
    });

    it('shows the select options', async () => {
      // render dropdown
      render(<FuzzySelect {...defaultProps} />);

      // Assert
      expect(await screen.findAllByRole('option')).toHaveLength(4);
      expect(
        await screen.findByRole('option', {
          name: 'I am different',
        }),
      ).toBeInTheDocument();
    });

    it('sorts options by label if no sortFn is provided', async () => {
      // render dropdown
      render(<FuzzySelect {...defaultProps} />);

      // Assert
      const options = await screen.findAllByRole('option');
      expect(options[0]).toHaveTextContent('A - label for id-1');
      expect(options[1]).toHaveTextContent('B - label for id-2');
      expect(options[2]).toHaveTextContent('C - label for id-3');
      expect(options[3]).toHaveTextContent('I am different');
    });

    it('truncates names that are longer than truncation', async () => {
      // render dropdown
      render(<FuzzySelect {...defaultProps} truncation={15} />);

      // Assert
      expect(
        await screen.findByRole('option', {
          name: 'A - l... l for id-1',
        }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('option', {
          name: 'C - l... l for id-3',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters by name', async () => {
      // render dropdown
      const { user } = render(<FuzzySelect {...defaultProps} />);

      // type something matching into search
      const searchBox = screen.getByPlaceholderText('Filter by name or ID');
      await user.clear(searchBox);
      await user.type(searchBox, 'id-'); // searching by label

      // Assert
      expect(await screen.findAllByRole('option')).toHaveLength(3);
      expect(
        screen.queryByRole('option', {
          name: 'I am different',
        }),
      ).not.toBeInTheDocument();
    });

    it('filters by ID', async () => {
      // render dropdown
      const { user } = render(<FuzzySelect {...defaultProps} />);

      // type something matching into search
      const searchBox = screen.getByPlaceholderText('Filter by name or ID');
      await user.clear(searchBox);
      await user.type(searchBox, 'item-'); // searching by ID

      // Assert
      expect(await screen.findAllByRole('option')).toHaveLength(3);
      expect(
        screen.queryByRole('option', {
          name: 'I am different',
        }),
      ).not.toBeInTheDocument();
    });

    it('shows "No results" if no option matches the filter text', async () => {
      // render dropdown
      const { user } = render(<FuzzySelect {...defaultProps} />);

      // type something matching into search
      const searchBox = screen.getByPlaceholderText('Filter by name or ID');
      await user.clear(searchBox);
      await user.type(searchBox, 'KO');

      // Assert
      expect(await screen.findByRole('option')).toBeInTheDocument();
      expect(
        await screen.findByRole('option', {
          name: 'No results found',
        }),
      ).toBeInTheDocument();
    });

    it('supports no fuzziness while filtering', async () => {
      const props = { ...defaultProps, fuzziness: 0 };
      // render dropdown
      const { user } = render(<FuzzySelect {...props} />);

      // type something close to an existing value but not an exact match
      const searchBox = screen.getByPlaceholderText('Filter by name or ID');
      await user.clear(searchBox);
      await user.type(searchBox, 'diffrent');

      // Assert
      expect(await screen.findByRole('option')).toBeInTheDocument();
      expect(
        await screen.findByRole('option', {
          name: 'No results found',
        }),
      ).toBeInTheDocument();

      // type something exactly matching a value
      await user.clear(searchBox);
      await user.type(searchBox, 'different');

      expect(await screen.findAllByRole('option')).toHaveLength(1);
      expect(
        screen.getByRole('option', {
          name: 'I am different',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('Clear selection (isClearable)', () => {
    it('does not render the clear control when isClearable is false despite a selected value', () => {
      render(
        <FuzzySelect
          {...defaultProps}
          isOpen={false}
          isClearable={false}
          selectedEntryId="item-111"
          onSelect={() => null}
        />,
      );
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
    });

    it('does not render the clear control when isClearable is true and nothing is selected', () => {
      render(
        <FuzzySelect
          {...defaultProps}
          isOpen={false}
          isClearable
          selectedEntryId=""
          onSelect={() => null}
        />,
      );
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
    });

    it('renders the clear control when isClearable is true and selectedEntryId is set', async () => {
      render(
        <FuzzySelect
          {...defaultProps}
          isOpen={false}
          isClearable
          selectedEntryId="item-111"
          onSelect={() => null}
        />,
      );
      expect(await screen.findByRole('button', { name: 'Clear selection' })).toBeInTheDocument();
    });

    it('does not render the clear control when isClearable is true but the select is disabled', () => {
      render(
        <FuzzySelect
          {...defaultProps}
          isOpen={false}
          isClearable
          isDisabled
          selectedEntryId="item-111"
          onSelect={() => null}
        />,
      );
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
    });

    it('calls onSelect with an empty string and closes the menu when the clear control is clicked', async () => {
      const onSelect = jest.fn();
      const onOpenChange = jest.fn();
      const { user } = render(
        <FuzzySelect
          {...defaultProps}
          isOpen
          isClearable
          selectedEntryId="item-111"
          onSelect={onSelect}
          onOpenChange={onOpenChange}
        />,
      );
      await user.click(await screen.findByRole('button', { name: 'Clear selection' }));
      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith(expect.any(Object), '');
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
