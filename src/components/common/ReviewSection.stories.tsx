import React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
} from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';

import ReviewSection, {
  ReviewItem,
} from '~/components/clusters/wizards/common/ReviewCluster/ReviewSection';

// Mock review items for demonstration
const MockReviewItems = () => (
  <>
    <DescriptionListGroup>
      <DescriptionListTerm>Cluster name</DescriptionListTerm>
      <DescriptionListDescription>my-rosa-cluster</DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Version</DescriptionListTerm>
      <DescriptionListDescription>4.14.8</DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Region</DescriptionListTerm>
      <DescriptionListDescription>us-east-1</DescriptionListDescription>
    </DescriptionListGroup>
  </>
);

const StoryWrapper = (props: any) => (
  <Grid hasGutter style={{ maxWidth: '800px', margin: '20px' }}>
    <ReviewSection {...props}>{props.children}</ReviewSection>
  </Grid>
);

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/Common/ReviewSection',
  component: StoryWrapper,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/common/ReviewSection/ReviewSection.tsx',
      componentType: 'form-section',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['formValues', 'valueTransform', 'displayConditions'],
      featureFlagDependencies: [],
      behaviors: [
        'expandable-section',
        'value-transformation',
        'conditional-display',
        'edit-navigation',
      ],
      sharedWith: ['wizard', 'review-step'],
      keyComponents: ['ExpandableSection', 'ReviewItem', 'ValueTransform', 'EditStepLink'],
      title: 'Review Section Display',
    },
    docs: {
      description: {
        component:
          'Expandable review section component used in wizard review screens. Features expand/collapse functionality and "Edit step" navigation links.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div>
        <div
          style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            marginBottom: '16px',
            borderRadius: '6px',
            border: '2px solid #f0ad4e',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              color: '#8a6d3b',
              fontSize: '15px',
              fontWeight: '700',
            }}
          >
            📝 Review Section Component
          </h4>
          <div style={{ lineHeight: '1.5', fontSize: '13px', color: '#8a6d3b' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Used by:</strong> Both ROSA and OSD wizard review screens
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Features:</strong> Expandable sections, edit step navigation, responsive
              layout
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Children:</strong> Typically ReviewItem components in DescriptionList format
            </p>
            <p style={{ margin: '0' }}>
              <strong>Note:</strong> FormikReviewItem requires Formik context - see main ROSA
              stories for full integration
            </p>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: {
      control: 'text',
      description: 'Section title displayed in the toggle',
    },
    initiallyExpanded: {
      control: 'boolean',
      description: 'Whether the section is initially expanded (inverted logic)',
    },
    onGoToStep: {
      action: 'onGoToStep',
      description: 'Callback when "Edit step" button is clicked',
    },
    children: {
      control: 'object',
      description: 'Review items to display in the section',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StoryWrapper>;

export const ClusterSettings: Story = {
  args: {
    title: 'Cluster settings',
    initiallyExpanded: false,
    onGoToStep: () => console.log('Navigate to Cluster settings step'),
    children: <MockReviewItems />,
  },
};

export const InitiallyCollapsed: Story = {
  args: {
    title: 'Networking',
    initiallyExpanded: true, // Note: inverted logic - true means starts collapsed
    onGoToStep: () => console.log('Navigate to Networking step'),
    children: (
      <>
        <DescriptionListGroup>
          <DescriptionListTerm>Cluster privacy</DescriptionListTerm>
          <DescriptionListDescription>Public</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Machine CIDR</DescriptionListTerm>
          <DescriptionListDescription>10.0.0.0/16</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Service CIDR</DescriptionListTerm>
          <DescriptionListDescription>172.30.0.0/16</DescriptionListDescription>
        </DescriptionListGroup>
      </>
    ),
  },
};

export const DefaultMachinePool: Story = {
  args: {
    title: 'Default machine pool',
    initiallyExpanded: false,
    onGoToStep: () => console.log('Navigate to Machine pool step'),
    children: (
      <>
        <DescriptionListGroup>
          <DescriptionListTerm>Instance type</DescriptionListTerm>
          <DescriptionListDescription>m5.xlarge</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Autoscaling</DescriptionListTerm>
          <DescriptionListDescription>Enabled</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Node count</DescriptionListTerm>
          <DescriptionListDescription>3-10 nodes</DescriptionListDescription>
        </DescriptionListGroup>
      </>
    ),
  },
};

export const Updates: Story = {
  args: {
    title: 'Updates',
    initiallyExpanded: false,
    onGoToStep: () => console.log('Navigate to Updates step'),
    children: (
      <>
        <DescriptionListGroup>
          <DescriptionListTerm>Update method</DescriptionListTerm>
          <DescriptionListDescription>Individual updates</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Node drain grace period</DescriptionListTerm>
          <DescriptionListDescription>1 hour</DescriptionListDescription>
        </DescriptionListGroup>
      </>
    ),
  },
};

// FormikReviewItem component for demonstration
const FormikReviewItemDemo = ({ fieldId, value }: { fieldId: string; value: any }) => (
  <DescriptionListGroup>
    <DescriptionListTerm>
      {fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
    </DescriptionListTerm>
    <DescriptionListDescription>
      {typeof value === 'object' ? value.id || JSON.stringify(value) : String(value)}
    </DescriptionListDescription>
  </DescriptionListGroup>
);

export const WithDemoReviewItems: Story = {
  args: {
    title: 'Cluster settings (Demo items)',
    initiallyExpanded: false,
    onGoToStep: () => console.log('Navigate to Cluster settings step'),
    children: (
      <>
        <FormikReviewItemDemo fieldId="clusterName" value="my-demo-cluster" />
        <FormikReviewItemDemo fieldId="clusterVersion" value={{ id: '4.14.8' }} />
        <FormikReviewItemDemo fieldId="region" value="us-west-2" />
        <FormikReviewItemDemo fieldId="multiAz" value="true" />
      </>
    ),
  },
};

export const WithPlainReviewItems: Story = {
  args: {
    title: 'Cluster settings (Plain)',
    initiallyExpanded: false,
    onGoToStep: () => console.log('Navigate to Cluster settings step'),
    children: (
      <>
        <ReviewItem name="clusterName" formValues={{ clusterName: 'my-plain-cluster' }} />
        <ReviewItem name="region" formValues={{ region: 'us-east-1' }} />
        <ReviewItem name="multiAz" formValues={{ multiAz: 'true' }} />
      </>
    ),
  },
};

export const LongSectionTitle: Story = {
  args: {
    title: 'Very Long Section Title That Might Wrap On Smaller Screens',
    initiallyExpanded: false,
    onGoToStep: () => console.log('Navigate to very long section'),
    children: <MockReviewItems />,
  },
};
