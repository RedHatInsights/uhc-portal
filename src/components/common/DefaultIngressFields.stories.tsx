import React from 'react';
import { Formik } from 'formik';

import { Form } from '@patternfly/react-core';
import { Meta, StoryObj } from '@storybook/react';

import { DefaultIngressFieldsFormik } from '~/components/clusters/wizards/rosa/NetworkScreen/DefaultIngressFieldsFormik';
// Mock action for stories since @storybook/addon-actions is not available
const action =
  (name: string) =>
  (...args: any[]) =>
    console.log(`${name}:`, ...args);

// Mock form state hook for stories
// Mock form state hook for stories - keeping for potential future use
// @ts-ignore - Unused but kept for future use
// eslint-disable-next-line
const _useFormStateMock = (initialValues: any) => ({
  getFieldProps: (name: string) => ({
    name,
    value: initialValues[name] || '',
    onChange: (value: any) => {
      action('field-changed')({ field: name, value });
    },
    onBlur: () => {
      action('field-blurred')(name);
    },
  }),
  getFieldMeta: (name: string) => ({
    error: undefined,
    touched: false,
  }),
});

// Component wrapper for stories with form context
const DefaultIngressFieldsWrapper = ({
  isDay2 = false,
  hasSufficientIngressEditVersion = true,
  isHypershiftCluster = false,
  canShowLoadBalancer = false,
  canEditLoadBalancer = true,
  areFieldsDisabled = false,
  showValidationErrors = false,
  initialValues = {},
}: {
  isDay2?: boolean;
  hasSufficientIngressEditVersion?: boolean;
  isHypershiftCluster?: boolean;
  canShowLoadBalancer?: boolean;
  canEditLoadBalancer?: boolean;
  areFieldsDisabled?: boolean;
  showValidationErrors?: boolean;
  initialValues?: any;
}) => {
  const defaultValues = {
    default_router_address: 'apps.cluster-name.example.com',
    private_default_router: false,
    defaultRouterSelectors: '',
    defaultRouterExcludedNamespacesFlag: '',
    clusterRoutesTlsSecretRef: '',
    clusterRoutesHostname: '',
    isDefaultRouterNamespaceOwnershipPolicyStrict: false,
    isDefaultRouterWildcardPolicyAllowed: false,
    is_nlb_load_balancer: false,
    ...initialValues,
  };

  const validationValues = showValidationErrors
    ? {
        ...defaultValues,
        defaultRouterSelectors: 'invalid-selector-format',
        defaultRouterExcludedNamespacesFlag: 'invalid namespace name!',
        clusterRoutesTlsSecretRef: 'invalid-secret-name!',
        clusterRoutesHostname: 'invalid-hostname-format',
      }
    : defaultValues;

  return (
    <Formik
      initialValues={validationValues}
      initialTouched={
        showValidationErrors
          ? {
              defaultRouterSelectors: true,
              defaultRouterExcludedNamespacesFlag: true,
              clusterRoutesTlsSecretRef: true,
              clusterRoutesHostname: true,
            }
          : {}
      }
      onSubmit={() => {}}
      validate={(values) => {
        const errors: any = {};
        if (showValidationErrors) {
          if (values.defaultRouterSelectors === 'invalid-selector-format') {
            errors.defaultRouterSelectors = 'Invalid selector format';
          }
          if (values.defaultRouterExcludedNamespacesFlag === 'invalid namespace name!') {
            errors.defaultRouterExcludedNamespacesFlag = 'Invalid namespace name';
          }
          if (values.clusterRoutesTlsSecretRef === 'invalid-secret-name!') {
            errors.clusterRoutesTlsSecretRef = 'Invalid secret name';
          }
          if (values.clusterRoutesHostname === 'invalid-hostname-format') {
            errors.clusterRoutesHostname = 'Invalid hostname format';
          }
        }
        return errors;
      }}
    >
      {({ values }) => (
        <Form style={{ maxWidth: '600px' }}>
          <DefaultIngressFieldsFormik
            isDay2={isDay2}
            hasSufficientIngressEditVersion={hasSufficientIngressEditVersion}
            isHypershiftCluster={isHypershiftCluster}
            canShowLoadBalancer={canShowLoadBalancer}
            canEditLoadBalancer={canEditLoadBalancer}
            areFieldsDisabled={areFieldsDisabled}
            values={values}
          />
        </Form>
      )}
    </Formik>
  );
};

const meta: Meta<typeof DefaultIngressFieldsFormik> = {
  title: 'Common/DefaultIngressFields',
  component: DefaultIngressFieldsFormik,
  parameters: {
    metadata: {
      sourceFile: '~/components/clusters/common/IngressFields/DefaultIngressFieldsFormik.tsx',
      componentType: 'form-section',
      usage: ['Classic'],
      conditionalLogic: [
        '!isHypershift',
        'clusterVersion >= 4.14',
        'applicationIngress === "custom"',
      ],
      featureFlagDependencies: ['application-ingress'],
      behaviors: [
        'classic-only',
        'version-dependent-features',
        'conditional-visibility',
        'progressive-disclosure',
      ],
      sharedWith: ['wizard', 'network-step'],
      keyComponents: ['DefaultIngressFields', 'IngressConfiguration', 'FormGroup', 'VersionCheck'],
      title: 'Default Ingress Fields Configuration',
    },
    docs: {
      description: {
        component: `
### DefaultIngressFields

A comprehensive form component for configuring OpenShift application ingress settings. **This component is conditionally shown and not always visible in the UI**.

**Visibility Logic:**
- **ROSA Classic Wizard**: Only appears when user selects "Custom settings" radio button (hidden by default)
- **ROSA Hosted**: Never shown - no Application Ingress section at all
- **Day 2 Operations**: Shown in "Edit Application Ingress" modal dialog

**Key Features:**
- **Route selectors** - Label selectors to filter which routes use the ingress controller
- **Excluded namespaces** - Namespaces to exclude from ingress routing
- **TLS configuration** - Custom TLS certificates and hostnames (Day 2 only)
- **Namespace ownership policy** - Control cross-namespace route ownership
- **Wildcard policy** - Allow or disallow wildcard routes
- **Load balancer types** - Classic vs Network Load Balancer selection
- **Private router** - Make application router private (Day 2 only)

### Usage Contexts
- **ROSA Classic Wizard** - Hidden by default, revealed when "Custom settings" selected
- **Day 2 Operations** - Edit existing cluster ingress configuration via modal dialog
- **Version-dependent** - Advanced features require cluster version 4.14+
- **Architecture-specific** - Some features not available on Hypershift clusters

### Field Visibility Logic
- **Day 2 fields**: Default router address, private router checkbox, TLS secret, hostname
- **Version-gated**: Route selectors, excluded namespaces, policies (4.14+ clusters)
- **Non-Hypershift only**: Most advanced configuration options
- **Load balancer**: Conditionally shown based on cluster capabilities

### Use Cases
- **Basic ingress**: Route selector and namespace exclusion
- **Advanced TLS**: Custom certificates and hostnames for Day 2 operations  
- **Policy control**: Namespace ownership and wildcard route policies
- **Load balancer optimization**: Switch between Classic and Network Load Balancer
        `,
      },
    },
  },
  argTypes: {
    isDay2: {
      control: { type: 'boolean' },
      description: 'Day 2 operations mode - shows additional fields',
    },
    hasSufficientIngressEditVersion: {
      control: { type: 'boolean' },
      description: 'Cluster version 4.14+ - enables advanced features',
    },
    isHypershiftCluster: {
      control: { type: 'boolean' },
      description: 'Hypershift cluster - disables some features',
    },
    canShowLoadBalancer: {
      control: { type: 'boolean' },
      description: 'Show load balancer type selection',
    },
    areFieldsDisabled: {
      control: { type: 'boolean' },
      description: 'Disable all form fields',
    },
  },
};

export default meta;

type Story = StoryObj<typeof DefaultIngressFieldsWrapper>;

export const RosaClassicWizard: Story = {
  name: 'Rosa Classic: Wizard Configuration',
  args: {
    isDay2: false,
    hasSufficientIngressEditVersion: true,
    isHypershiftCluster: false,
    canShowLoadBalancer: false,
    areFieldsDisabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'ROSA Classic wizard "Custom settings" content. This appears only when user selects "Custom settings" radio button (hidden by default). Shows route selectors, excluded namespaces, and policy settings for cluster version 4.14+.',
      },
    },
  },
  render: (args) => (
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
          Rosa Classic: Custom Ingress Settings
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> ROSA Classic wizard "Custom
            settings" option
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Features:</strong> Route selectors, namespace
            exclusions, policies
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Cluster version:</strong> 4.14+
            (hasSufficientIngressEditVersion)
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Load balancer:</strong> Not shown in wizard (Day 2
            only)
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <DefaultIngressFieldsWrapper {...args} />
      </div>
    </div>
  ),
};

export const Day2EditDialog: Story = {
  name: 'Day 2: Edit Application Ingress',
  args: {
    isDay2: true,
    hasSufficientIngressEditVersion: true,
    isHypershiftCluster: false,
    canShowLoadBalancer: true,
    canEditLoadBalancer: true,
    areFieldsDisabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Day 2 operations modal for editing existing cluster ingress. Shows all available fields including default router address, private router toggle, TLS configuration, and load balancer selection.',
      },
    },
  },
  render: (args) => (
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
          Day 2: Complete Ingress Configuration
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> Edit Application Ingress modal
            dialog
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>All features:</strong> Router address, TLS,
            policies, load balancer
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>TLS fields:</strong> Custom certificate secret and
            hostname
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Load balancer:</strong> Classic vs Network Load
            Balancer toggle
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <DefaultIngressFieldsWrapper {...args} />
      </div>
    </div>
  ),
};

export const RosaHostedDisabled: Story = {
  name: 'Rosa Hosted: Limited Features',
  args: {
    isDay2: false,
    hasSufficientIngressEditVersion: true,
    isHypershiftCluster: true,
    canShowLoadBalancer: false,
    areFieldsDisabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'ROSA Hosted (Hypershift) clusters have limited ingress configuration options. Most advanced features are disabled due to the hosted control plane architecture.',
      },
    },
  },
  render: (args) => (
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
          Rosa Hosted: Hypershift Limitations
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> ROSA Hosted cluster with hosted
            control plane
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Limitation:</strong> Advanced ingress features not
            available
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Architecture:</strong> Hypershift
            (isHypershiftCluster=true)
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Result:</strong> Minimal or no configuration
            options shown
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <DefaultIngressFieldsWrapper {...args} />
      </div>
    </div>
  ),
};

export const LegacyClusterVersion: Story = {
  name: 'Rosa Classic: Legacy Version - Limited Features',
  args: {
    isDay2: false,
    hasSufficientIngressEditVersion: false,
    isHypershiftCluster: false,
    canShowLoadBalancer: false,
    areFieldsDisabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'ROSA Classic cluster with version below 4.14. Advanced ingress features are not available due to insufficient cluster version. Shows empty state when no fields are enabled.',
      },
    },
  },
  render: (args) => (
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
          Rosa Classic: Version Limitations
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> ROSA Classic cluster version &lt;
            4.14
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Limitation:</strong>{' '}
            hasSufficientIngressEditVersion = false
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Features blocked:</strong> Route selectors,
            policies, custom TLS
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Result:</strong> No ingress configuration options
            available
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <DefaultIngressFieldsWrapper {...args} />
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#fff3cd',
            border: 'solid 1px #ffeaa7',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#856404',
          }}
        >
          <strong>Note:</strong> No configuration fields are shown for clusters below version 4.14.
          Users must upgrade their cluster to access advanced ingress settings.
        </div>
      </div>
    </div>
  ),
};

export const ValidationErrors: Story = {
  name: 'Rosa Classic: Validation Errors',
  args: {
    isDay2: true,
    hasSufficientIngressEditVersion: true,
    isHypershiftCluster: false,
    canShowLoadBalancer: true,
    areFieldsDisabled: false,
    showValidationErrors: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows validation errors for all form fields with invalid data. Demonstrates error states, field validation, and user feedback for incorrect input formats.',
      },
    },
  },
  render: (args) => (
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
          Rosa Classic: Form Validation Examples
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> Day 2 edit dialog with validation
            errors
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Invalid data:</strong> Route selectors, namespaces,
            TLS fields
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Visual cues:</strong> Red borders and error
            messages
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>User action:</strong> Fix input formats to clear
            errors
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <DefaultIngressFieldsWrapper {...args} />
      </div>
    </div>
  ),
};

export const DisabledFieldsState: Story = {
  name: 'Day 2: Disabled Fields State',
  args: {
    isDay2: true,
    hasSufficientIngressEditVersion: true,
    isHypershiftCluster: true,
    canShowLoadBalancer: false,
    areFieldsDisabled: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows disabled state for all form fields. Used in Hypershift clusters where ingress configuration is managed by the hosted control plane and cannot be modified.',
      },
    },
  },
  render: (args) => (
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
          Day 2: Disabled Fields (Hypershift)
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Context:</strong> Day 2 modal with Hypershift
            cluster
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> areFieldsDisabled = true
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Reason:</strong> Hosted control plane manages
            ingress settings
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Visual:</strong> All form fields grayed out and
            non-interactive
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <DefaultIngressFieldsWrapper {...args} />
      </div>
    </div>
  ),
};
