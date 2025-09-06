import React from 'react';
import { Form, Formik } from 'formik';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { thunk } from 'redux-thunk';

import type { Meta, StoryObj } from '@storybook/react';

import SharedVPCDomainSelect from './SharedVPCDomainSelect';

// Mock DNS domains data
const mockDnsDomains = [
  {
    Kind: 'DnsDomain',
    id: '1234.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/1234.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
  {
    Kind: 'DnsDomain',
    id: 'abcd.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/abcd.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
  {
    Kind: 'DnsDomain',
    id: 'prod-cluster.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/prod-cluster.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
  {
    Kind: 'DnsDomain',
    id: 'dev-env.s1.devshift.org',
    href: '/api/clusters_mgmt/v1/dns_domains/dev-env.s1.devshift.org',
    organization: {
      kind: 'OrganizationLink',
      id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
      href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
    },
    user_defined: true,
  },
];

const withState = (
  initialValues: any,
  dnsState: any,
): {
  store: MockStoreEnhanced<unknown, any>;
  Wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const middlewares = [thunk, promiseMiddleware] as any;
  const mockStore = createMockStore(middlewares);
  const store: MockStoreEnhanced<unknown, {}> = mockStore({
    // Mock Redux state structure for consistency
    ccsInquiries: {
      vpcs: {
        fulfilled: true,
        pending: false,
        error: false,
        data: {
          items: [],
        },
      },
    },
    dnsDomains: dnsState,
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        <Form>{children}</Form>
      </Formik>
    </Provider>
  );

  return { store, Wrapper };
};

type StoryWrapperProps = {
  label: string;
  selectedDomain?: string;
  dnsDomainsState: {
    error: boolean;
    pending: boolean;
    fulfilled: boolean;
    isUpdatingDomains: boolean;
    createdDnsId: string;
    deletedDnsId: string;
    items: any[];
  };
  showValidationError?: boolean;
};

const StoryWrapper = ({
  label,
  selectedDomain,
  dnsDomainsState,
  showValidationError,
}: StoryWrapperProps) => {
  const initialValues = {
    base_dns_domain: selectedDomain || '',
  };

  const { Wrapper } = withState(initialValues, dnsDomainsState);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
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
          SharedVPCDomainSelect - DNS Domain Selection
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Available Domains:</strong>{' '}
            {dnsDomainsState.items?.length || 0}
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Selected Domain:</strong>{' '}
            {selectedDomain || 'None selected'}
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong>{' '}
            {dnsDomainsState.pending
              ? 'Loading...'
              : dnsDomainsState.isUpdatingDomains
                ? 'Updating...'
                : dnsDomainsState.error
                  ? 'Error'
                  : 'Ready'}
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Features:</strong> Select existing, create new,
            copy, delete domains
          </p>
        </div>
      </div>

      <Wrapper>
        <SharedVPCDomainSelect
          label={label}
          input={{
            value: selectedDomain || '',
            onChange: (e: any) =>
              console.log('Domain changed:', typeof e === 'string' ? e : e.target.value),
            onBlur: () => {},
            name: 'base_dns_domain',
          }}
          meta={{
            value: selectedDomain || '',
            initialTouched: false,
            touched: showValidationError || false,
            error: showValidationError ? 'This field is required.' : '',
          }}
        />
      </Wrapper>
    </div>
  );
};

const meta: Meta<typeof StoryWrapper> = {
  title: 'Wizards/ROSA/Common/SharedVPCDomainSelect',
  component: StoryWrapper,
  parameters: {
    layout: 'fullscreen',
    metadata: {
      sourceFile: '~/components/clusters/wizards/rosa/NetworkingSection/SharedVPCDomainSelect.tsx',
      componentType: 'form-field',
      usage: ['Classic', 'Hosted'],
      conditionalLogic: ['dnsDomains.items.length', 'isUpdatingDomains', 'selectedDomain'],
      featureFlagDependencies: [],
      behaviors: [
        'fuzzy-select-dropdown',
        'domain-creation',
        'domain-deletion',
        'copy-to-clipboard',
        'loading-states',
        'error-handling',
      ],
      sharedWith: ['shared-vpc-field'],
      keyComponents: [
        'FuzzySelect',
        'FormGroup',
        'Button',
        'CopyToClipboard',
        'Tooltip',
        'ErrorBox',
      ],
      title: 'DNS Domain Selection with Management',
    },
    docs: {
      description: {
        component: `
### SharedVPCDomainSelect - DNS Domain Selection and Management

The SharedVPCDomainSelect component provides a comprehensive interface for selecting, creating, and managing DNS domains for AWS Shared VPC configurations. It combines domain selection with management capabilities in a single, user-friendly interface.

**Key Features:**

### **Domain Selection**
- **FuzzySelect Dropdown**: Searchable dropdown with filtering capabilities
- **Existing Domains**: Shows all available DNS domains for the organization
- **Placeholder Text**: Clear guidance when no domain is selected
- **Validation**: Visual feedback for required field validation

### **Domain Management**

#### **Create New Domain**
- **Reserve New**: "Reserve new base DNS domain" button in dropdown footer
- **Loading State**: Shows "Reserving new base DNS domain..." during creation
- **Auto-Selection**: Automatically selects newly created domain
- **Error Handling**: Shows error messages if domain creation fails

#### **Copy Domain**
- **Copy Button**: Copy icon button next to the dropdown
- **Clipboard Integration**: Uses react-copy-to-clipboard for copying
- **Disabled State**: Grayed out when no domain is selected
- **Accessibility**: Proper ARIA labels and keyboard support

#### **Delete Domain**
- **Delete Button**: Trash icon button with confirmation tooltip
- **Loading State**: Shows "Deleting a base DNS domain..." during deletion
- **Auto-Clear**: Clears selection when domain is deleted
- **Confirmation**: Tooltip warns about permanent deletion

### **State Management**
- **Redux Integration**: Connected to dnsDomains Redux state
- **Loading States**: Handles pending, updating, and error states
- **Real-time Updates**: Responds to domain creation/deletion
- **Error Recovery**: Clear error states and retry mechanisms

### **User Experience**

#### **Loading States**
- **Initial Load**: Shows loading placeholder while fetching domains
- **Creating Domain**: Updates placeholder text during creation
- **Deleting Domain**: Shows deletion progress
- **Disabled States**: Disables interactions during operations

#### **Error Handling**
- **Creation Errors**: Shows error box with retry options
- **Deletion Errors**: Displays error messages with context
- **Network Errors**: Graceful handling of API failures
- **Clear Errors**: Option to dismiss error messages

#### **Accessibility**
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical focus flow through interface
- **High Contrast**: Works with high contrast themes

### **Integration**
- **Formik Integration**: Works seamlessly with Formik form state
- **Field Validation**: Supports required field validation
- **Meta Information**: Displays validation errors and touched state
- **Form Submission**: Properly integrates with form submission flow

### **Props Control**
- \`label\`: Field label text
- \`input\`: Formik input props (value, onChange, onBlur, name)
- \`meta\`: Formik meta props (touched, error for validation)
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the DNS domain field',
    },
    selectedDomain: {
      control: 'text',
      description: 'Currently selected DNS domain',
    },
    showValidationError: {
      control: 'boolean',
      description: 'Show validation error state',
    },
  },
  render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

export const EmptyState: Story = {
  name: 'Empty State (No Selection)',
  args: {
    label: 'Base DNS domain',
    selectedDomain: '',
    dnsDomainsState: {
      error: false,
      pending: false,
      fulfilled: true,
      isUpdatingDomains: false,
      createdDnsId: '',
      deletedDnsId: '',
      items: mockDnsDomains,
    },
    showValidationError: false,
  },
  parameters: {
    docs: {
      description: {
        story: `**Empty State with Available Domains**

Shows the initial state with no domain selected but multiple domains available for selection.

**Configuration:**
- **Available Domains**: 4 DNS domains ready for selection
- **Selected**: None (empty state)
- **State**: Ready for user interaction

**Key Behaviors:**
- Shows "Select base DNS domain" placeholder
- Copy and delete buttons are disabled (no selection)
- Dropdown shows all available domains when opened
- "Reserve new base DNS domain" option available in footer`,
      },
    },
  },
};

export const DomainSelected: Story = {
  name: 'Domain Selected',
  args: {
    label: 'Base DNS domain',
    selectedDomain: 'prod-cluster.s1.devshift.org',
    dnsDomainsState: {
      error: false,
      pending: false,
      fulfilled: true,
      isUpdatingDomains: false,
      createdDnsId: '',
      deletedDnsId: '',
      items: mockDnsDomains,
    },
    showValidationError: false,
  },
  parameters: {
    docs: {
      description: {
        story: `**Domain Selected State**

Shows the component with a DNS domain selected, enabling management actions.

**Configuration:**
- **Selected Domain**: prod-cluster.s1.devshift.org
- **Management Actions**: Copy and delete buttons enabled
- **State**: Ready for domain management or reselection

**Key Behaviors:**
- Shows selected domain name in the field
- Copy button enabled - click to copy domain to clipboard
- Delete button enabled with warning tooltip
- Can reopen dropdown to select different domain`,
      },
    },
  },
};

export const CreatingNewDomain: Story = {
  name: 'Creating New Domain',
  args: {
    label: 'Base DNS domain',
    selectedDomain: '',
    dnsDomainsState: {
      error: false,
      pending: false,
      fulfilled: true,
      isUpdatingDomains: true, // Creating new domain
      createdDnsId: '',
      deletedDnsId: '',
      items: mockDnsDomains,
    },
    showValidationError: false,
  },
  parameters: {
    docs: {
      description: {
        story: `**Creating New Domain State**

Shows the loading state while a new DNS domain is being created.

**Configuration:**
- **State**: Creating new domain (isUpdatingDomains: true)
- **Placeholder**: "Reserving new base DNS domain..."
- **Interactions**: All controls disabled during creation

**Key Behaviors:**
- Shows loading placeholder text
- Dropdown and management buttons disabled
- User cannot interact until creation completes
- Will auto-select new domain when creation finishes`,
      },
    },
  },
};

export const NewDomainCreated: Story = {
  name: 'New Domain Created',
  args: {
    label: 'Base DNS domain',
    selectedDomain: 'neww.s1.devshift.org',
    dnsDomainsState: {
      error: false,
      pending: false,
      fulfilled: true,
      isUpdatingDomains: false,
      createdDnsId: 'neww.s1.devshift.org', // Newly created domain
      deletedDnsId: '',
      items: [
        ...mockDnsDomains,
        {
          Kind: 'DnsDomain',
          id: 'neww.s1.devshift.org',
          href: '/api/clusters_mgmt/v1/dns_domains/neww.s1.devshift.org',
          organization: {
            kind: 'OrganizationLink',
            id: 'mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
            href: '/api/accounts_mgmt/v1/organizations/mD3zE0uSJQTQLS0JHEpEJ7AfQpM',
          },
          user_defined: true,
        },
      ],
    },
    showValidationError: false,
  },
  parameters: {
    docs: {
      description: {
        story: `**New Domain Successfully Created**

Shows the state after a new DNS domain has been successfully created and auto-selected.

**Configuration:**
- **New Domain**: neww.s1.devshift.org (auto-selected)
- **Domain List**: Updated to include the new domain
- **State**: Ready for use with the new domain

**Key Behaviors:**
- New domain automatically selected after creation
- Domain list now includes the newly created domain
- Copy and delete buttons enabled for the new domain
- User can proceed with the selected new domain`,
      },
    },
  },
};

export const DeletingDomain: Story = {
  name: 'Deleting Domain',
  args: {
    label: 'Base DNS domain',
    selectedDomain: 'dev-env.s1.devshift.org',
    dnsDomainsState: {
      error: false,
      pending: false,
      fulfilled: true,
      isUpdatingDomains: true, // Deleting domain
      createdDnsId: '',
      deletedDnsId: '',
      items: mockDnsDomains,
    },
    showValidationError: false,
  },
  parameters: {
    docs: {
      description: {
        story: `**Deleting Domain State**

Shows the loading state while a DNS domain is being deleted.

**Configuration:**
- **State**: Deleting domain (isUpdatingDomains: true)
- **Selected**: dev-env.s1.devshift.org (being deleted)
- **Interactions**: All controls disabled during deletion

**Key Behaviors:**
- Shows "Deleting a base DNS domain..." loading state
- All interactions disabled during deletion process
- Selected domain will be cleared when deletion completes
- User cannot interact until deletion finishes`,
      },
    },
  },
};

export const ValidationError: Story = {
  name: 'Validation Error',
  args: {
    label: 'Base DNS domain',
    selectedDomain: '',
    dnsDomainsState: {
      error: false,
      pending: false,
      fulfilled: true,
      isUpdatingDomains: false,
      createdDnsId: '',
      deletedDnsId: '',
      items: mockDnsDomains,
    },
    showValidationError: true,
  },
  parameters: {
    docs: {
      description: {
        story: `**Validation Error State**

Shows the field validation error when the required field is not filled.

**Configuration:**
- **Selected**: None (empty - triggers validation)
- **Validation**: Field is required error shown
- **State**: Form validation active

**Key Behaviors:**
- Shows "This field is required." error message
- Field border may show error styling (depends on theme)
- Error persists until domain is selected
- FormGroupHelperText displays the validation message`,
      },
    },
  },
};

export const CreationError: Story = {
  name: 'Domain Creation Error',
  args: {
    label: 'Base DNS domain',
    selectedDomain: '',
    dnsDomainsState: {
      error: true, // Error occurred
      pending: false,
      fulfilled: false,
      isUpdatingDomains: false,
      createdDnsId: '',
      deletedDnsId: '',
      items: mockDnsDomains,
      // errorMessage: 'Failed to create DNS domain. Please try again.', // Not part of the expected type
    },
    showValidationError: false,
  },
  parameters: {
    docs: {
      description: {
        story: `**Domain Creation Error**

Shows the error state when DNS domain creation fails.

**Configuration:**
- **Error State**: Domain creation failed
- **Error Message**: "Failed to create DNS domain. Please try again."
- **Recovery**: User can dismiss error and retry

**Key Behaviors:**
- Shows ErrorBox component with creation error message
- User can close the error alert to retry
- Dropdown remains functional for selecting existing domains
- "Reserve new base DNS domain" option still available for retry`,
      },
    },
  },
};

export const NoDomains: Story = {
  name: 'No Domains Available',
  args: {
    label: 'Base DNS domain',
    selectedDomain: '',
    dnsDomainsState: {
      error: false,
      pending: false,
      fulfilled: true,
      isUpdatingDomains: false,
      createdDnsId: '',
      deletedDnsId: '',
      items: [], // No domains available
    },
    showValidationError: false,
  },
  parameters: {
    docs: {
      description: {
        story: `**No Domains Available**

Shows the state when no DNS domains are available in the organization.

**Configuration:**
- **Available Domains**: 0 (empty list)
- **Primary Action**: Create new domain
- **State**: Ready for domain creation

**Key Behaviors:**
- Dropdown shows empty state when opened
- "Reserve new base DNS domain" is the primary option
- User must create a new domain to proceed
- Copy and delete buttons remain disabled (no domains)`,
      },
    },
  },
};

export const LoadingDomains: Story = {
  name: 'Loading Domains',
  args: {
    label: 'Base DNS domain',
    selectedDomain: '',
    dnsDomainsState: {
      error: false,
      pending: true, // Loading domains
      fulfilled: false,
      isUpdatingDomains: false,
      createdDnsId: '',
      deletedDnsId: '',
      items: [],
    },
    showValidationError: false,
  },
  parameters: {
    docs: {
      description: {
        story: `**Loading Domains State**

Shows the initial loading state while DNS domains are being fetched.

**Configuration:**
- **State**: Loading (pending: true)
- **Domains**: Not yet loaded
- **Interface**: Disabled during loading

**Key Behaviors:**
- Shows loading state in dropdown
- All interactions disabled until loading completes
- Placeholder text indicates loading state
- Will populate with domains once loading finishes`,
      },
    },
  },
};
