import React from 'react';
import { Field, Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import { FormGroup } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { baseRequestState } from '~/redux/reduxHelpers';

import CloudRegionSelectField from './index';

const mockAWSRegions = [
  {
    id: 'us-east-1',
    name: 'us-east-1',
    display_name: 'US East (N. Virginia)',
    supports_multi_az: true,
    supports_hypershift: true,
    enabled: true,
    ccs_only: false,
  },
  {
    id: 'us-west-2',
    name: 'us-west-2',
    display_name: 'US West (Oregon)',
    supports_multi_az: true,
    supports_hypershift: true,
    enabled: true,
    ccs_only: false,
  },
  {
    id: 'eu-west-1',
    name: 'eu-west-1',
    display_name: 'Europe (Ireland)',
    supports_multi_az: true,
    supports_hypershift: true,
    enabled: true,
    ccs_only: false,
  },
  {
    id: 'ap-southeast-1',
    name: 'ap-southeast-1',
    display_name: 'Asia Pacific (Singapore)',
    supports_multi_az: true,
    supports_hypershift: false, // Not Hypershift compatible
    enabled: true,
    ccs_only: false,
  },
  {
    id: 'ca-central-1',
    name: 'ca-central-1',
    display_name: 'Canada (Central)',
    supports_multi_az: false, // Single AZ only
    supports_hypershift: true,
    enabled: true,
    ccs_only: false,
  },
];

const withState = (
  initialState: any,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
} => {
  const store = createMockStore([thunk, promiseMiddleware as any])(initialState);

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  };

  return { store, Wrapper };
};

const meta: Meta<typeof CloudRegionSelectField> = {
  title: 'Wizards/Common/CloudRegionSelectField',
  component: CloudRegionSelectField,
  parameters: {
    metadata: {
      sourceFile:
        '~/components/clusters/wizards/common/ClusterSettings/Details/CloudRegionSelectField/index.tsx',
      componentType: 'field',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['isHypershift', 'isMultiAZ', 'supportsHypershift', 'supportsMultiAz'],
      featureFlagDependencies: [],
      behaviors: [
        'region-filtering',
        'hypershift-compatibility-check',
        'multi-az-support-check',
        'dropdown-selection',
      ],
      sharedWith: ['wizard', 'cluster-details-step'],
      keyComponents: ['RegionDropdown', 'RegionFiltering', 'CompatibilityCheck', 'FormGroup'],
      title: 'Cloud Region Selection',
    },
  },
  render: (args: any) => {
    const { Wrapper } = withState({
      cloudProviders: {
        ...baseRequestState,
        fulfilled: true,
        providers: {
          [CloudProviderType.Aws]: {
            id: CloudProviderType.Aws,
            name: 'Amazon Web Services',
            regions: mockAWSRegions.reduce((acc, region) => {
              acc[region.id] = region;
              return acc;
            }, {} as any),
          },
        },
      },
    });

    return (
      <Wrapper>
        <Formik
          initialValues={{
            region: 'us-east-1',
          }}
          onSubmit={() => {}}
        >
          <FormGroup label="Region" isRequired>
            <Field
              component={CloudRegionSelectField}
              name="region"
              cloudProviderID={CloudProviderType.Aws}
              isBYOC
              isMultiAz
              isHypershiftSelected={false}
              {...args}
            />
          </FormGroup>
        </Formik>
      </Wrapper>
    );
  },
};

export default meta;

type Story = StoryObj<typeof CloudRegionSelectField>;

export const Default: Story = {
  name: 'Classic - Multi-AZ',
  args: {},
  render: (args: any) => {
    const { Wrapper } = withState({
      cloudProviders: {
        ...baseRequestState,
        fulfilled: true,
        providers: {
          [CloudProviderType.Aws]: {
            id: CloudProviderType.Aws,
            name: 'Amazon Web Services',
            regions: mockAWSRegions.reduce((acc, region) => {
              acc[region.id] = region;
              return acc;
            }, {} as any),
          },
        },
      },
    });

    return (
      <Wrapper>
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              marginBottom: '24px',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            }}
          >
            <h4
              style={{
                margin: '0 0 16px 0',
                color: '#495057',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              Multi-AZ Classic Mode
            </h4>
            <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Configuration:</strong> isMultiAz: true,
                isHypershiftSelected: false
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Shows:</strong> All regions available for
                selection (5 regions)
              </p>
              <p style={{ margin: '0' }}>
                <strong style={{ color: '#495057' }}>Use case:</strong> Standard multi-AZ region
                selection for Classic ROSA clusters
              </p>
            </div>
          </div>

          <Formik
            initialValues={{
              region: 'us-east-1',
            }}
            onSubmit={() => {}}
          >
            <FormGroup label="Region" isRequired>
              <Field
                component={CloudRegionSelectField}
                name="region"
                cloudProviderID={CloudProviderType.Aws}
                isBYOC
                isMultiAz
                isHypershiftSelected={false}
                {...args}
              />
            </FormGroup>
          </Formik>
        </div>
      </Wrapper>
    );
  },
};

export const HypershiftMode: Story = {
  name: 'Hosted - Multi-AZ',
  args: {
    isHypershiftSelected: true,
  },
  render: (args: any) => {
    const { Wrapper } = withState({
      cloudProviders: {
        ...baseRequestState,
        fulfilled: true,
        providers: {
          [CloudProviderType.Aws]: {
            id: CloudProviderType.Aws,
            name: 'Amazon Web Services',
            regions: mockAWSRegions.reduce((acc, region) => {
              acc[region.id] = region;
              return acc;
            }, {} as any),
          },
        },
      },
    });

    return (
      <Wrapper>
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              marginBottom: '24px',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            }}
          >
            <h4
              style={{
                margin: '0 0 16px 0',
                color: '#495057',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              Hypershift (Hosted Control Plane) Mode
            </h4>
            <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Configuration:</strong> isMultiAz: true,
                isHypershiftSelected: true
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Shows:</strong> Only Hypershift-compatible
                regions (4 regions - ap-southeast-1 filtered out)
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Filtering:</strong> Regions with
                supports_hypershift: false are hidden/disabled
              </p>
              <p style={{ margin: '0' }}>
                <strong style={{ color: '#495057' }}>Use case:</strong> Region selection for Hosted
                Control Plane clusters
              </p>
            </div>
          </div>

          <Formik
            initialValues={{
              region: 'us-east-1',
            }}
            onSubmit={() => {}}
          >
            <FormGroup label="Region" isRequired>
              <Field
                component={CloudRegionSelectField}
                name="region"
                cloudProviderID={CloudProviderType.Aws}
                isBYOC
                isMultiAz
                isHypershiftSelected
                {...args}
              />
            </FormGroup>
          </Formik>
        </div>
      </Wrapper>
    );
  },
};

export const SingleAZ: Story = {
  name: 'Classic - Single Zone',
  args: {
    isMultiAz: false,
  },
  render: (args: any) => {
    const { Wrapper } = withState({
      cloudProviders: {
        ...baseRequestState,
        fulfilled: true,
        providers: {
          [CloudProviderType.Aws]: {
            id: CloudProviderType.Aws,
            name: 'Amazon Web Services',
            regions: mockAWSRegions.reduce((acc, region) => {
              acc[region.id] = region;
              return acc;
            }, {} as any),
          },
        },
      },
    });

    return (
      <Wrapper>
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              marginBottom: '24px',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            }}
          >
            <h4
              style={{
                margin: '0 0 16px 0',
                color: '#495057',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              Single Availability Zone Mode
            </h4>
            <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Configuration:</strong> isMultiAz: false,
                isHypershiftSelected: false
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Shows:</strong> All regions (some may show
                different behavior for single-AZ)
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong style={{ color: '#495057' }}>Note:</strong> ca-central-1 has
                supports_multi_az: false in mock data
              </p>
              <p style={{ margin: '0' }}>
                <strong style={{ color: '#495057' }}>Use case:</strong> Region selection for single
                availability zone clusters
              </p>
            </div>
          </div>

          <Formik
            initialValues={{
              region: 'us-east-1',
            }}
            onSubmit={() => {}}
          >
            <FormGroup label="Region" isRequired>
              <Field
                component={CloudRegionSelectField}
                name="region"
                cloudProviderID={CloudProviderType.Aws}
                isBYOC
                isMultiAz={false}
                isHypershiftSelected={false}
                {...args}
              />
            </FormGroup>
          </Formik>
        </div>
      </Wrapper>
    );
  },
};
