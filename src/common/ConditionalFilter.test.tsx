import React from 'react';

import { render, screen } from '~/testUtils';

import { ConditionalFilter, conditionalFilterType } from './ConditionalFilter';

describe('<ConditionalFilter />', () => {
  const filter1OnChange = jest.fn();
  const filter2OnChange = jest.fn();
  const filter3OnChange = jest.fn();

  const filters = [
    {
      type: conditionalFilterType.text,
      value: 'my_filter_1',
      label: 'My text filter 1',
      filterValues: {
        onChange: filter1OnChange,
        value: '',
      },
    },

    {
      type: conditionalFilterType.checkbox,
      value: 'my_filter_2',
      label: 'My checkbox filter 2',
      filterValues: {
        onChange: filter2OnChange,
        items: [
          { label: 'checkbox 2 - option 1', value: 'checkbox 2 - option 1 value' },
          { label: 'checkbox 2 - option 2', value: 'checkbox 2 - option 2 value' },
          { label: 'checkbox 2 - option 3', value: 'checkbox 2 - option 3 value' },
        ],
        value: [],
      },
    },

    {
      type: conditionalFilterType.text,
      value: 'my_filter_3',
      label: 'My text filter 3',
      filterValues: {
        onChange: filter3OnChange,
        value: '',
      },
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('displays first filter by default', () => {
    render(<ConditionalFilter items={filters} />);

    expect(screen.getByPlaceholderText(`Filter by ${filters[0].label}`)).toBeInTheDocument();
  });

  it('displays correct number of filter select options', async () => {
    const { user } = render(<ConditionalFilter items={filters} />);

    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Select filter' }));

    expect(screen.getAllByRole('menuitem')).toHaveLength(filters.length);
  });

  it('switches filter  when filter select changes', async () => {
    const { user } = render(<ConditionalFilter items={filters} />);

    expect(screen.queryByPlaceholderText(`Filter by ${filters[2].label}`)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Select filter' }));

    await user.click(screen.getByText(filters[2].label));

    expect(screen.getByPlaceholderText(`Filter by ${filters[2].label}`)).toBeInTheDocument();
  });

  it('displays textbox for textbox filters', async () => {
    expect(filters[2].type).toEqual(conditionalFilterType.text);
    const { user } = render(<ConditionalFilter items={filters} />);

    await user.click(screen.getByRole('button', { name: 'Select filter' }));

    await user.click(screen.getByText(filters[2].label));

    expect(screen.getByPlaceholderText(`Filter by ${filters[2].label}`)).toHaveAttribute(
      'type',
      'text',
    );
  });

  it('displays checkboxes for checkbox filters', async () => {
    expect(filters[1].type).toEqual(conditionalFilterType.checkbox);
    const { user } = render(<ConditionalFilter items={filters} />);

    await user.click(screen.getByRole('button', { name: 'Select filter' }));

    await user.click(screen.getByText(filters[1].label));

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);

    await user.click(screen.getByText('Filter by My checkbox filter 2'));

    // @ts-ignore
    expect(screen.getAllByRole('checkbox')).toHaveLength(filters[1].filterValues.items?.length);

    filters[1].filterValues.items?.forEach((item) => {
      expect(screen.getByLabelText(item.label)).toBeInTheDocument();
    });
  });

  it('displays value for a textbox filter', async () => {
    const newFilters = [
      ...filters,
      {
        type: conditionalFilterType.text,
        value: 'my_filter_last',
        label: 'My text filter last',
        filterValues: {
          onChange: jest.fn(),
          value: 'my filter value',
        },
      },
    ];

    const newFilterIndex = newFilters.length - 1;
    const { user } = render(<ConditionalFilter items={newFilters} />);
    await user.click(screen.getByRole('button', { name: 'Select filter' }));

    await user.click(screen.getByText(newFilters[newFilterIndex].label));

    expect(screen.getByRole('textbox')).toHaveValue('my filter value');
  });

  it('checks checkboxes for items that have been selected', async () => {
    const newFilters = [
      ...filters,
      {
        type: conditionalFilterType.checkbox,
        value: 'my_filter_last',
        label: 'My checkbox filter last',
        filterValues: {
          onChange: filter2OnChange,
          items: [
            { label: 'checkbox 2 - option 1', value: 'checkbox 2 - option 1 value' },
            { label: 'checkbox 2 - option 2', value: 'checkbox 2 - option 2 value' },
            { label: 'checkbox 2 - option 3', value: 'checkbox 2 - option 3 value' },
          ],
          value: ['checkbox 2 - option 1 value', 'checkbox 2 - option 2 value'],
        },
      },
    ];

    const newFilterIndex = newFilters.length - 1;
    const { user } = render(<ConditionalFilter items={newFilters} />);
    await user.click(screen.getByRole('button', { name: 'Select filter' }));

    await user.click(screen.getByText(newFilters[newFilterIndex].label));

    await user.click(screen.getByText('Filter by My checkbox filter last'));

    const checkBoxes = screen.getAllByRole('checkbox');

    expect(checkBoxes[0]).toBeChecked();
    expect(checkBoxes[1]).toBeChecked();
    expect(checkBoxes[2]).not.toBeChecked();
  });

  it('calls onchange when text is entered in textbox', async () => {
    expect(filters[2].type).toEqual(conditionalFilterType.text);
    const { user } = render(<ConditionalFilter items={filters} />);

    await user.click(screen.getByRole('button', { name: 'Select filter' }));

    await user.click(screen.getByText(filters[2].label));

    expect(filters[2].filterValues.onChange).not.toHaveBeenCalled();

    await user.type(screen.getByPlaceholderText(`Filter by ${filters[2].label}`), 'hello');

    expect(filters[2].filterValues.onChange).toHaveBeenLastCalledWith(expect.anything(), 'hello');
  });

  it('calls onchange when user checks and unchecks checkboxes', async () => {
    const newFilters = [
      ...filters,
      {
        type: conditionalFilterType.checkbox,
        value: 'my_filter_last',
        label: 'My checkbox filter last',
        filterValues: {
          onChange: filter2OnChange,
          items: [
            { label: 'checkbox 2 - option 1', value: 'checkbox 2 - option 1 value' },
            { label: 'checkbox 2 - option 2', value: 'checkbox 2 - option 2 value' },
            { label: 'checkbox 2 - option 3', value: 'checkbox 2 - option 3 value' },
          ],
          value: ['checkbox 2 - option 3 value'],
        },
      },
    ];

    const newFilterIndex = newFilters.length - 1;

    const { user } = render(<ConditionalFilter items={newFilters} />);

    await user.click(screen.getByRole('button', { name: 'Select filter' }));

    await user.click(screen.getByText(newFilters[newFilterIndex].label));

    await user.click(screen.getByText(`Filter by ${newFilters[newFilterIndex].label}`));

    const checkBoxes = screen.getAllByRole('checkbox');

    // @ts-ignore
    const items = newFilters[newFilterIndex].filterValues.items || [];

    expect(checkBoxes[0]).not.toBeChecked();
    expect(checkBoxes[1]).not.toBeChecked();
    expect(checkBoxes[2]).toBeChecked();

    // checking unchecked:
    await user.click(checkBoxes[0]);

    expect(newFilters[1].filterValues.onChange).toHaveBeenLastCalledWith(expect.anything(), [
      items[2].value,
      items[0].value,
    ]);

    // clicking on already checked:
    await user.click(checkBoxes[2]);

    expect(newFilters[1].filterValues.onChange).toHaveBeenLastCalledWith(expect.anything(), []);
  });
});
