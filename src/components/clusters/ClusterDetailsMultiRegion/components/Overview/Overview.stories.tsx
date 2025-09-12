import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { HAS_USER_DISMISSED_RECOMMENDED_OPERATORS_ALERT } from '~/common/localStorageConstants';
import { normalizedProducts } from '~/common/subscriptionTypes';
import clusterStates from '~/components/clusters/common/clusterStates';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import ClusterDetailsTop from '../ClusterDetailsTop/ClusterDetailsTop';

import {
  errorStateCluster,
  hibernatingCluster,
  installingOnlyCluster,
  mockFeatureGates,
  mockReduxState,
  mockReduxStateNoTerms,
  readyAlertsCluster,
  // postInstallationCluster, // Unused
  // mockCloudProviders, // Unused
  // mockUserAccess, // Unused
  // mockInsightsData, // Unused
} from './Overview.stories.fixtures';

// Mock localStorage for recommended operators alert
const mockLocalStorage = {
  getItem: (key: string) => {
    if (key === HAS_USER_DISMISSED_RECOMMENDED_OPERATORS_ALERT) {
      return null; // Show the alert
    }
    return null;
  },
  setItem: () => {},
  removeItem: () => {},
};

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(relativeTime);

// Replace localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock Redux stores
const mockStore = createStore(() => mockReduxState);
const mockStoreNoTerms = createStore(() => mockReduxStateNoTerms);

// Mock Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// Note: React Query hooks will be mocked through Storybook's MSW or parameters
// ClusterStatusMonitor will use the cluster prop when clusterStatus data is null

const meta: Meta<typeof ClusterDetailsTop> = {
  title: 'Cluster/Cluster Details/Alerts',
  component: ClusterDetailsTop,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Cluster Details alerts showing various warning, error, and info states that can appear simultaneously on the cluster overview page.',
      },
    },
    // Mock feature gates
    mockData: [
      {
        url: '/api/feature_toggles*',
        method: 'GET',
        status: 200,
        response: mockFeatureGates,
      },
      {
        url: '/api/accounts_mgmt/v1/current_account/terms_review',
        method: 'POST',
        status: 200,
        response: {
          terms_required: true,
          redirect_url: 'https://console.redhat.com/terms',
        },
      },
    ],
  },
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <div style={{ padding: '2rem' }}>
            <Story />
            <NotificationsPortal />
          </div>
        </QueryClientProvider>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ClusterDetailsTop>;

// Base props for all stories
const baseProps = {
  pending: false,
  error: false,
  errorMessage: '',
  clusterIdentityProviders: [],
  organization: { id: 'org-123', name: 'Test Organization' },
  canSubscribeOCP: true,
  canTransferClusterOwnership: true,
  isAutoClusterTransferOwnershipEnabled: true,
  canHibernateCluster: true,
  autoRefreshEnabled: true,
  showPreviewLabel: false,
  isClusterIdentityProvidersLoading: false,
  clusterIdentityProvidersError: false,
  isRefetching: false,
  regionalInstance: null,
  openDrawer: () => {},
  closeDrawer: () => {},
  selectedCardTitle: '',
  refreshFunc: () => {},
  region: 'us-east-1',
  toggleSubscriptionReleased: () => {},
};

/**
 * Shows ONLY installation-specific alerts that appear during cluster installation.
 * These alerts are hidden once cluster reaches ready state:
 *
 * INSTALLATION-SPECIFIC ALERTS SHOWING:
 * - "Your cluster is being created" (INFO - Recommended Operators with installation message)
 * - GCP Organization Policy Alert (WARNING - only shows when cluster.state !== ready)
 *
 * Note: "Installation Taking Longer" alert requires React Query mocking and may not show in Storybook.
 * The Terms & Conditions alert has been excluded as it's a general alert, not installation-specific.
 */
export const InstallingAlerts: Story = {
  args: {
    ...baseProps,
    cluster: installingOnlyCluster, // Uses installing state, no general alerts
    clusterIdentityProviders: [], // Not relevant during installation
    gcpOrgPolicyWarning:
      "Unable to validate organization policies for project 'my-gcp-project-123'",
  },
  decorators: [
    (Story) => (
      <Provider store={mockStoreNoTerms}>
        <QueryClientProvider client={queryClient}>
          <div style={{ padding: '2rem' }}>
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#e7f1fa',
                border: '1px solid #bee1f4',
                borderRadius: '4px',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#004368' }}>
                📋 Installation-Specific Alerts
              </h3>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px' }}>
                <strong>Cluster State:</strong> installing | <strong>Plan Type:</strong> OCP (no
                Terms alert)
              </p>
              <p style={{ margin: '0', fontSize: '14px' }}>
                <strong>Alerts Shown:</strong>
                <br />
                • "Your cluster is being created" (INFO - RecommendedOperatorsAlert)
                <br />
                • "GCP Organization Policy Service" (WARNING - only during installation)
                <br />
                <em>Note: "Installation Taking Longer" alert requires React Query mocking</em>
                <br />
                <strong>Note: if you don't see all the alerts, please refresh the browser.</strong>
              </p>
            </div>
            <Story />
            <NotificationsPortal />
          </div>
        </QueryClientProvider>
      </Provider>
    ),
  ],
};

/**
 * Shows error state alerts including installation failure and critical issues.
 */
export const ErrorStateAlerts: Story = {
  args: {
    ...baseProps,
    cluster: errorStateCluster,
    error: true,
    errorMessage: 'Cluster installation failed',
    clusterIdentityProviders: [],
  },
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <div style={{ padding: '2rem' }}>
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#fdf2f2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f1d1d' }}>🚨 Error State Alerts</h3>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px' }}>
                <strong>Cluster State:</strong> error | <strong>Support Level:</strong> None
                (expired evaluation)
              </p>
              <p style={{ margin: '0', fontSize: '14px' }}>
                <strong>Alerts Shown:</strong>
                <br />
                • "Cluster installation failed" (DANGER - ClusterStatusMonitor)
                <br />
                • "60-day OpenShift evaluation expired" (DANGER - SubscriptionCompliancy)
                <br />
                <strong>Note: if you don't see all the alerts, please refresh the browser.</strong>
              </p>
            </div>
            <Story />
            <NotificationsPortal />
          </div>
        </QueryClientProvider>
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Cluster in error state showing installation failure and subscription compliancy alerts.',
      },
    },
  },
};

/**
 * Shows alerts for ready/operational clusters.
 * Demonstrates the 1 ready-specific alert + all general alerts that can appear at any stage:
 *
 * READY-SPECIFIC ALERT:
 * - Create Identity Provider (INFO - only shows when cluster.state === ready)
 *
 * GENERAL ALERTS (can appear at any stage):
 * - Recommended Operators (INFO - different message for operational clusters)
 * - Terms & Conditions (WARNING - based on subscription, not cluster state)
 * - Cluster Expiration (DANGER - based on timestamp, not cluster state)
 * - Limited Support (DANGER - based on support reasons, not cluster state)
 * - Subscription Compliancy (DANGER - based on subscription, not cluster state)
 *
 * Note: GCP Org Policy Alert is intentionally excluded as it only shows during installation.
 */
export const ReadyAlerts: Story = {
  args: {
    ...baseProps,
    cluster: readyAlertsCluster, // Uses ready state + general alerts
    clusterIdentityProviders: [], // Empty array triggers IDP alert
    gcpOrgPolicyWarning: undefined, // Not relevant for ready clusters
  },
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <div style={{ padding: '2rem' }}>
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bfdbfe',
                borderRadius: '4px',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>
                ✅ Ready State + General Alerts
              </h3>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px' }}>
                <strong>Cluster State:</strong> ready | <strong>Plan Type:</strong> OSD |{' '}
                <strong>Support:</strong> None (expired eval)
              </p>
              <p style={{ margin: '0', fontSize: '14px' }}>
                <strong>Alerts Shown:</strong>
                <br />
                • "Create an identity provider" (INFO - ready-specific alert)
                <br />
                • "Optimize your cluster with operators" (INFO - RecommendedOperatorsAlert)
                <br />
                • "You must accept Terms & Conditions" (WARNING - general alert)
                <br />
                • "This cluster will be deleted in 12 hours" (DANGER - general alert)
                <br />
                • "This cluster has limited support" (DANGER - general alert)
                <br />
                <strong>Note: if you don't see all the alerts, please refresh the browser.</strong>
              </p>
            </div>
            <Story />
            <NotificationsPortal />
          </div>
        </QueryClientProvider>
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Ready cluster showing the Identity Provider alert plus all general alerts that can appear at any cluster lifecycle stage.',
      },
    },
  },
};

/**
 * Shows hibernating cluster with limited functionality alerts.
 */
export const HibernatingClusterAlerts: Story = {
  args: {
    ...baseProps,
    cluster: hibernatingCluster,
    clusterIdentityProviders: [],
  },
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <div style={{ padding: '2rem' }}>
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#fefce8',
                border: '1px solid #fde047',
                borderRadius: '4px',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#a16207' }}>
                💤 Hibernating Cluster Components
              </h3>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px' }}>
                <strong>Cluster State:</strong> hibernating | <strong>Plan Type:</strong> OCP
              </p>
              <p style={{ margin: '0', fontSize: '14px' }}>
                <strong>Expected Components:</strong>
                <br />
                • HibernatingClusterCard: "Cluster is currently hibernating" (card with resume
                button)
                <br />
                • RecommendedOperatorsAlert: "Your cluster is currently hibernating" (INFO alert
                with operators)
                <br />
                <em>
                  Note: RecommendedOperatorsAlert may require additional mocking if not visible
                </em>
                <br />
                <strong>Note: if you don't see all the alerts, please refresh the browser.</strong>
              </p>
            </div>
            <Story />
            <NotificationsPortal />
          </div>
        </QueryClientProvider>
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Hibernating cluster showing two components: HibernatingClusterCard ("Cluster is currently hibernating" with resume button) and RecommendedOperatorsAlert ("Your cluster is currently hibernating" with operators info).',
      },
    },
  },
};

/**
 * Shows the "Cluster non editable" alert for Assisted Installer clusters.
 */
export const AssistedInstallerCannotEditAlert: Story = {
  name: "Assisted Installer: 'Cannot Edit' Alert",
  args: {
    ...baseProps,
    cluster: {
      id: 'test-ai-cluster',
      name: 'myAssistedInstallerCluster',
      state: clusterStates.ready,
      canEdit: false, // This should trigger the alert
      aiCluster: { id: 'ai-cluster-123' }, // This makes it an AI cluster
      subscription: {
        id: 'sub-123',
        plan: {
          id: normalizedProducts.OCP_AssistedInstall, // This makes it an AI subscription
          type: normalizedProducts.OCP,
        },
        status: SubscriptionCommonFieldsStatus.Active, // Not archived
        creator: {
          username: 'test-user',
          email: 'test-user@example.com',
        },
      },
      // Minimal properties to avoid other alerts
      limitedSupportReasons: [],
      expiration_timestamp: undefined,
      status: {
        description: 'Cluster is ready',
      },
    },
    clusterIdentityProviders: [], // Don't show IDP alert
    gcpOrgPolicyWarning: undefined, // Don't show GCP alert
  },
  decorators: [
    (Story) => {
      // Mock localStorage to dismiss recommended operators alert for this story
      const originalGetItem = window.localStorage.getItem;
      window.localStorage.getItem = (key) => {
        if (key === HAS_USER_DISMISSED_RECOMMENDED_OPERATORS_ALERT) {
          return 'true'; // Mark as dismissed
        }
        return originalGetItem.call(window.localStorage, key);
      };

      return (
        <Provider store={mockStoreNoTerms}>
          <QueryClientProvider client={queryClient}>
            <div style={{ padding: '2rem' }}>
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
                  🔒 Assisted Installer Permission Alert
                </h3>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px' }}>
                  <strong>Cluster:</strong> myAssistedInstallerCluster | <strong>State:</strong>{' '}
                  ready | <strong>Plan:</strong> OCP_AssistedInstall
                </p>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  <strong>Alert Shown:</strong>
                  <br />
                  • "You cannot edit the cluster" (INFO - ClusterNonEditableAlert)
                  <br />
                  <em>Condition: !canEdit && isAvailableAssistedInstallCluster()</em>
                  <br />
                  <strong>
                    Note: if you don't see all the alerts, please refresh the browser.
                  </strong>
                </p>
              </div>
              <Story />
              <NotificationsPortal />
            </div>
          </QueryClientProvider>
        </Provider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Assisted Installer cluster showing the "You cannot edit the cluster" alert when user lacks edit permissions.',
      },
    },
  },
};
