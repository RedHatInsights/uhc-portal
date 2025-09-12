import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import MachinePoolScreenHeader from '../../MachinePoolScreen/MachinePoolScreenHeader';

const meta: Meta<typeof MachinePoolScreenHeader> = {
  title: 'Wizards/ROSA/Step 3: Cluster settings/Machine pool/MachinePoolScreenHeader',
  component: MachinePoolScreenHeader,
  parameters: {
    docs: {
      description: {
        component: `
## Machine Pool Screen Header

The Machine Pool Screen Header component provides context-aware header content that changes based on the ROSA cluster architecture mode.

### Key Features
- **Conditional rendering** - Shows different headers for ROSA Hosted vs ROSA Classic
- **Clear guidance** - Provides specific instructions for each architecture mode
- **Consistent styling** - Uses PatternFly Grid and Typography components
- **Architecture awareness** - Content adapts to ROSA Hosted vs ROSA Classic deployment modes

### Architecture Modes

#### **ROSA Hosted**
- **Title**: "Machine pools" 
- **Focus**: Creating multiple machine pools with private subnet selection
- **Key message**: Specify private subnets for each machine pool
- **Post-creation**: Additional machine pools can be added after cluster creation

#### **ROSA Classic**  
- **Title**: "Default machine pool"
- **Focus**: Single default machine pool configuration
- **Key message**: Select compute node instance type and count
- **Important warning**: Instance type selection is **permanent** after cluster creation

### Business Logic
- **Flexibility vs Permanence** - ROSA Hosted allows post-creation changes, ROSA Classic has permanent decisions
- **Architecture Focus** - ROSA Hosted focuses on multiple machine pools, ROSA Classic focuses on single pool configuration
- **Subnet Management** - ROSA Hosted requires private subnet specification, ROSA Classic uses default networking

### Components Included
- **PatternFly Grid** for layout structure
- **Title** component with consistent h3 heading level
- **Content** components for descriptive text
- **Conditional rendering** based on \`isHypershiftSelected\` prop

### Use Cases
- Guiding users through machine pool setup in ROSA wizard
- Explaining architectural differences between ROSA Hosted and ROSA Classic
- Setting proper expectations about post-creation limitations
- Providing context for subsequent machine pool configuration steps
        `,
      },
    },
  },
  argTypes: {
    isHypershiftSelected: {
      control: 'boolean',
      description: 'Whether ROSA Hosted (hosted control plane) mode is selected',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof MachinePoolScreenHeader>;

export const ROSAHosted: Story = {
  args: {
    isHypershiftSelected: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
### ROSA Hosted Mode

Shows the **"Machine pools"** header with guidance for creating multiple machine pools with private subnet selection.

**Key Messages:**
- Create machine pools and specify the private subnet for each pool
- Additional machine pools can be created after cluster creation
- Focus on flexible, scalable architecture with hosted control plane
- Private subnet selection is required for each machine pool

**Use Case:** When users select ROSA Hosted architecture for hosted control plane deployment.
        `,
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
          ROSA Hosted Machine Pool Header
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> ROSA Hosted
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Shows "Machine pools" title with
            subnet selection guidance
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Interaction:</strong> Header content only, no user
            interaction
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Guiding users to create multiple
            machine pools with private subnet selection
          </p>
        </div>
      </div>
      <MachinePoolScreenHeader {...args} />
    </div>
  ),
};

export const ROSAClassic: Story = {
  args: {
    isHypershiftSelected: false,
  },
  parameters: {
    docs: {
      description: {
        story: `
### ROSA Classic Mode

Shows the **"Default machine pool"** header with guidance for configuring the single default machine pool.

**Key Messages:**
- Select compute node instance type and count for default machine pool
- **Important warning:** Instance type selection is permanent after cluster creation
- Focus on getting the initial configuration right

**Use Case:** When users select ROSA Classic architecture for traditional self-managed control plane deployment.
        `,
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
          ROSA Classic Machine Pool Header
        </h4>
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: '#6c757d' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Mode:</strong> ROSA Classic
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>State:</strong> Shows "Default machine pool" title
            with permanence warning
          </p>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong style={{ color: '#495057' }}>Interaction:</strong> Header content only, no user
            interaction
          </p>
          <p style={{ margin: '0' }}>
            <strong style={{ color: '#495057' }}>Use case:</strong> Warning users that instance type
            selection is permanent
          </p>
        </div>
      </div>
      <MachinePoolScreenHeader {...args} />
    </div>
  ),
};
