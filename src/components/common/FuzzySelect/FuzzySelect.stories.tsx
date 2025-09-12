import React, { useState } from 'react';

import { Button } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { FuzzyEntryType } from '~/components/common/FuzzySelect/types';

import { FuzzySelect, FuzzySelectProps } from './FuzzySelect';

const entries: FuzzyEntryType[] = [
  { entryId: 'item-211', label: 'B - label for id-2' },
  { entryId: 'item-111', label: 'A - label for id-1' },
  { entryId: 'item-333', label: 'C - label for id-3' },
];

const groupedItems = {
  'Full support': [
    {
      entryId: '4.16.7',
      label: '4.16.7',
      groupKey: 'Full support',
    },
    {
      entryId: '4.16.6',
      label: '4.16.6',
      groupKey: 'Full support',
    },
  ],
  'Maintenance support': [
    {
      entryId: '4.14.34',
      label: '4.14.34',
      groupKey: 'Maintenance support',
    },
    {
      entryId: '4.14.33',
      label: '4.14.33',
      groupKey: 'Maintenance support',
    },
  ],
};

const awsAccounts = [
  {
    entryId: '000000000001',
    label: '000000000001',
    description: '',
  },
  {
    entryId: '000000000002',
    label: '000000000002',
    description: '',
  },
  {
    entryId: '000000000003',
    label: '000000000003',
    description: '',
  },
  {
    entryId: '000000000004',
    label: '000000000004',
    description: '',
  },
  {
    entryId: '000000000006',
    label: '000000000006',
    description: '',
  },
  {
    entryId: '000000000007',
    label: '000000000007',
    description: '',
  },
];

const meta: Meta<typeof FuzzySelect> = {
  title: 'Common/FuzzySelect',
  component: FuzzySelect,
  render: (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string>();

    const onSelect: FuzzySelectProps['onSelect'] = (_event, selection) => {
      setIsOpen(false);
      setSelectedOption(String(selection));
    };
    return (
      <FuzzySelect
        isOpen={isOpen}
        selectedEntryId={selectedOption}
        onSelect={onSelect}
        {...props}
        onOpenChange={setIsOpen}
      />
    );
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 1em', minHeight: '15em' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FuzzySelect>;

export const First: Story = {
  name: 'Basic with filter',
  args: {
    selectionData: entries,
  },
};

export const NoFuzzyness: Story = {
  name: 'No fuzziness',
  args: {
    selectionData: entries,
    fuzziness: 0,
  },
};

export const MaxFuxxyness: Story = {
  name: 'Maximum fuzziness',
  args: {
    selectionData: entries,
    fuzziness: 1,
  },
};

export const GroupedOptions: Story = {
  name: 'Grouped options',
  args: {
    selectionData: groupedItems,
  },
};

export const NoResults: Story = {
  name: 'No options available',
  args: {
    selectionData: [],
    isDisabled: true,
    placeholderText: 'No options available',
  },
};

export const PreselectedOption: Story = {
  name: 'Pre-selected option',
  args: {
    selectionData: entries,
    fuzziness: 0,
    selectedEntryId: entries[0].entryId,
  },
};

export const ValidationError: Story = {
  name: 'Validation / Error',
  args: {
    selectionData: entries,
    validated: 'danger',
  },
};

export const ValidationSuccess: Story = {
  name: 'Validation / Success',
  args: {
    selectionData: entries,
    selectedEntryId: entries[0].entryId,
    validated: 'success',
  },
};

export const Footer: Story = {
  name: 'With Footer',
  args: {
    selectionData: awsAccounts,
    placeholderText: 'Select an account',
    inlineFilterPlaceholderText: 'Filter by account ID',
    footer: (
      <Button
        variant="secondary"
        component="a"
        href="https://console.aws.amazon.com/rosa/home"
        target="_blank"
      >
        How to associate a new AWS account
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectToggle = canvas.getByRole('button');
    await userEvent.click(selectToggle);
  },
};

export const FilterValidation: Story = {
  name: 'Filter validation',
  args: {
    selectionData: awsAccounts,
    placeholderText: 'Select an account',
    inlineFilterPlaceholderText: 'Filter by account ID',
    filterValidate: { pattern: /^\d*$/, message: 'Please enter numeric digits only.' },
  },
  play: async ({ context, canvasElement }) => {
    const canvas = within(canvasElement);
    await Footer.play?.(context);
    const filterInput = canvas.getByLabelText('Filter by account ID', {
      selector: 'input',
    });
    await userEvent.type(filterInput, 'abc', {
      delay: 100,
    });
  },
};

export const LimitedWidth: Story = {
  name: 'Limited width with overflowing options',
  args: {
    selectionData: [
      {
        entryId: '1',
        label: 'This is a very long label that I expect will overflow its container',
      },
    ],
    popperProps: {
      maxWidth: 'trigger',
    },
    toggleStyle: { width: '300px' },
  },
  play: async ({ context }) => {
    await Footer.play?.(context);
  },
};

export const Truncation: Story = {
  args: {
    ...LimitedWidth.args,
    truncation: 20,
  },
  play: async ({ context }) => {
    await Footer.play?.(context);
  },
};

export const TruncationAndPopover: Story = {
  name: 'Truncation and popover',
  args: {
    ...Truncation.args,
    isPopover: true,
  },
  play: async ({ context }) => {
    await Footer.play?.(context);
  },
};
