import React from 'react';
import { FieldArray, Formik } from 'formik';

import type { Meta, StoryObj } from '@storybook/react';

import { FieldId } from '~/components/clusters/wizards/common/constants';

import FormKeyValueList, { type FormKeyValueListProps } from './FormKeyValueList';

type Row = { id?: string; key?: string; value?: string };

type FormKeyValueListStoryProps = Omit<FormKeyValueListProps, 'push' | 'remove'> & {
  initialRows?: Row[];
};

const FormKeyValueListStory = ({
  initialRows,
  arrayFieldName = FieldId.NodeLabels,
  ...listProps
}: FormKeyValueListStoryProps) => (
  <Formik
    initialValues={{
      [arrayFieldName]: initialRows ?? [],
    }}
    onSubmit={() => {}}
  >
    <FieldArray name={arrayFieldName}>
      {(arrayHelpers) => (
        <FormKeyValueList
          push={arrayHelpers.push}
          remove={arrayHelpers.remove}
          {...listProps}
          arrayFieldName={arrayFieldName}
        />
      )}
    </FieldArray>
  </Formik>
);

const meta: Meta<typeof FormKeyValueListStory> = {
  title: 'Shared/FormKeyValueList',
  component: FormKeyValueListStory,
  argTypes: {
    allowKeyWithoutValue: {
      control: 'boolean',
      description:
        'When false, Add stays disabled until every row with a key also has a value (e.g. exclude-namespace selectors). When true (default), validators only gate adding.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 1em', maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FormKeyValueListStory>;

export const Default: Story = {
  name: 'Default (node labels)',
  args: {},
};

export const WithPrefilledRows: Story = {
  name: 'Prefilled rows',
  args: {
    initialRows: [
      { key: 'environment', value: 'production' },
      { key: 'team', value: 'platform' },
    ],
  },
};

export const CustomLabels: Story = {
  name: 'Custom column and add button labels',
  args: {
    keyColumnLabel: 'Selector key',
    valueColumnLabel: 'Values (comma-separated)',
    addButtonLabel: 'Add selector',
    valueInputAriaLabel: 'Selector values',
    initialRows: [{ key: 'app', value: 'frontend,api' }],
  },
};

const customAnnotationsField = 'custom_annotations';

export const CustomArrayField: Story = {
  name: 'Custom array field name',
  args: {
    arrayFieldName: customAnnotationsField,
    keyColumnLabel: 'Annotation',
    valueColumnLabel: 'Value',
    addButtonLabel: 'Add annotation',
    initialRows: [{ key: 'example.com/contact', value: 'support@example.com' }],
  },
};

/** Key-only row: Add is enabled so users can add more rows before filling values (e.g. optional labels). */
export const AllowKeyWithoutValue: Story = {
  name: 'allowKeyWithoutValue: true',
  args: {
    allowKeyWithoutValue: true,
    initialRows: [{ key: 'fill-value-later', value: '' }],
  },
};

/** Key without value: Add stays disabled until the value column is filled (strict key/value pairs). */
export const RequireValuePerKey: Story = {
  name: 'allowKeyWithoutValue: false',
  args: {
    allowKeyWithoutValue: false,
    initialRows: [{ key: 'namespace-label', value: '' }],
  },
};
