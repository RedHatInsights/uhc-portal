import React from 'react';
import { Form, Formik } from 'formik';

import type { Meta, StoryObj } from '@storybook/react';

import {
  GroupsApplicationsSelector,
  type GroupsApplicationsSelectorProps,
} from './GroupsApplicationsSelector';
import {
  mockLogForwardingGroupTree,
  mockLogForwardingGroupTreeLabelGroupOverflow,
  mockLogForwardingGroupTreeLabelGroupOverflowAllLeafIds,
} from './logForwardingGroupTreeData';

/**
 * Stories use mock `treeData` only. The shared `GroupsApplicationsSelector` does not import the
 * API layer (avoids `APP_DEV_SERVER` and other app config in Storybook). The ROSA wizard uses
 * `LogForwardingGroupsApplicationsSelector` for live data. The tree list has no search field—the
 * full tree is always shown.
 */
const MOCK_TREE_DATA = mockLogForwardingGroupTree;

const FIELD_NAME = 'groupsApplicationsSelection';

type StoryArgs = GroupsApplicationsSelectorProps & {
  /** Seed value for the Formik field (leaf ids). */
  initialSelectedIds: string[];
};

function StoryFormikShell({ initialSelectedIds, ...selectorProps }: StoryArgs) {
  return (
    <Formik<Record<string, string[]>>
      initialValues={{ [selectorProps.name]: initialSelectedIds }}
      enableReinitialize
      onSubmit={() => undefined}
    >
      <Form noValidate style={{ maxWidth: '1100px' }}>
        <GroupsApplicationsSelector {...selectorProps} />
      </Form>
    </Formik>
  );
}

const meta = {
  title: 'Shared/GroupsApplicationsSelector',
  component: GroupsApplicationsSelector,
  args: {
    name: FIELD_NAME,
    treeData: MOCK_TREE_DATA,
    initialSelectedIds: [],
    isRequired: false,
    isDisabled: false,
    listMinHeight: '320px',
  },
  argTypes: {
    initialSelectedIds: {
      control: 'object',
      description: 'Initial selected leaf ids (story-only; resets when changed in Controls)',
    },
    treeData: {
      control: 'object',
      description:
        'Mock tree (`mockLogForwardingGroupTree`). Required for this presentational component.',
    },
    isRequired: {
      description: 'Marks the field required (asterisk / validation messaging).',
    },
    availableTooltip: {
      control: 'text',
      description: 'Help popover beside the available list title.',
    },
    chosenTooltip: {
      control: 'text',
      description: 'Help popover beside the chosen list title.',
    },
    containerMaxHeight: {
      control: 'text',
      description:
        'Max height of the two-card row; panes scroll internally. Pass empty string to disable.',
    },
  },
  render: (args: StoryArgs) => <StoryFormikShell {...args} />,
  decorators: [
    (Story) => (
      <div style={{ margin: '0 .5em 2em', minHeight: '26rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<StoryArgs>;

export default meta;

type Story = StoryObj<StoryArgs>;

/** Primary documentation canvas: empty selection by default; use Controls for required + tooltips. */
export const Docs: Story = {
  args: {
    treeData: MOCK_TREE_DATA,
    initialSelectedIds: [],
    isRequired: false,
    availableTooltip: 'Choose which control plane log sources to forward.',
    chosenTooltip: 'Remove individual apps or an entire group with the row action.',
  },
};

export const PartialSelection: Story = {
  name: 'Partial selection',
  args: {
    treeData: MOCK_TREE_DATA,
    initialSelectedIds: ['auth-konnectivity-agent', 'api-audit', 'controller-manager'],
  },
};

export const FullGroupSelected: Story = {
  name: 'Full group selected',
  args: {
    treeData: MOCK_TREE_DATA,
    initialSelectedIds: ['api-audit', 'api-server'],
  },
};

/** Selected pane LabelGroup overflow: more than `numLabels` (8) leaves in one group → “$N more”. */
export const LabelGroupOverflow: Story = {
  name: 'Label group overflow',
  args: {
    treeData: mockLogForwardingGroupTreeLabelGroupOverflow,
    initialSelectedIds: [...mockLogForwardingGroupTreeLabelGroupOverflowAllLeafIds],
  },
};

/** Short row height so each card scrolls inside its border (see `containerMaxHeight`). */
export const ConstrainedMaxHeight350: Story = {
  name: 'Constrained max height (350px)',
  args: {
    containerMaxHeight: '350px',
    treeData: MOCK_TREE_DATA,
    initialSelectedIds: ['auth-konnectivity-agent', 'api-audit', 'api-server'],
  },
};

export const Disabled: Story = {
  args: {
    treeData: MOCK_TREE_DATA,
    isDisabled: true,
    initialSelectedIds: ['auth-kube-apiserver', 'api-server'],
  },
};
