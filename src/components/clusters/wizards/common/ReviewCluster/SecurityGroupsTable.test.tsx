import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';
import { SecurityGroup } from '~/types/clusters_mgmt.v1';

import SecurityGroupsTable, { buildSecurityGroups } from './SecurityGroupsTable';

const mockVpcGroups: SecurityGroup[] = [
  { id: 'sg-control-1', name: 'Control Plane Group 1' },
  { id: 'sg-control-2', name: 'Control Plane Group 2' },
  { id: 'sg-worker-1', name: 'Worker Group 1' },
  { id: 'sg-worker-2', name: 'Worker Group 2' },
  { id: 'sg-infra-1', name: 'Infrastructure Group 1' },
  { id: 'sg-unknown', name: '' }, // Group without name
];

const defaultFormGroups = {
  applyControlPlaneToAll: false,
  controlPlane: ['sg-control-1', 'sg-control-2'],
  infra: ['sg-infra-1'],
  worker: ['sg-worker-1', 'sg-worker-2'],
};

type RenderProps = {
  vpcGroups?: SecurityGroup[];
  formGroups?: {
    applyControlPlaneToAll: boolean;
    controlPlane: string[];
    infra: string[];
    worker: string[];
  };
  isHypershiftSelected?: boolean;
};

const renderComponent = ({
  vpcGroups = mockVpcGroups,
  formGroups = defaultFormGroups,
  isHypershiftSelected = false,
}: RenderProps = {}) => {
  const { container, user } = render(
    <SecurityGroupsTable
      vpcGroups={vpcGroups}
      formGroups={formGroups}
      isHypershiftSelected={isHypershiftSelected}
    />,
  );
  return { container, user };
};

describe('<SecurityGroupsTable />', () => {
  describe('buildSecurityGroups utility function', () => {
    it('maps selected group IDs to security group objects with names', () => {
      const selectedGroupIds = ['sg-control-1', 'sg-worker-1'];
      const result = buildSecurityGroups(mockVpcGroups, selectedGroupIds);

      expect(result).toEqual([
        { id: 'sg-control-1', name: 'Control Plane Group 1' },
        { id: 'sg-worker-1', name: 'Worker Group 1' },
      ]);
    });

    it('uses group ID as name when group is not found in vpcGroups', () => {
      const selectedGroupIds = ['sg-not-found', 'sg-control-1'];
      const result = buildSecurityGroups(mockVpcGroups, selectedGroupIds);

      expect(result).toEqual([
        { id: 'sg-not-found', name: 'sg-not-found' },
        { id: 'sg-control-1', name: 'Control Plane Group 1' },
      ]);
    });

    it('handles empty selectedGroupIds array', () => {
      const result = buildSecurityGroups(mockVpcGroups, []);
      expect(result).toEqual([]);
    });

    it('handles empty vpcGroups array', () => {
      const selectedGroupIds = ['sg-1', 'sg-2'];
      const result = buildSecurityGroups([], selectedGroupIds);

      expect(result).toEqual([
        { id: 'sg-1', name: 'sg-1' },
        { id: 'sg-2', name: 'sg-2' },
      ]);
    });
  });

  describe('Hypershift scenarios', () => {
    it('renders only worker nodes section when hypershift is selected', () => {
      renderComponent({ isHypershiftSelected: true });

      expect(screen.getByText('Worker nodes')).toBeInTheDocument();
      expect(screen.queryByText('Control plane nodes')).not.toBeInTheDocument();
      expect(screen.queryByText('Infrastructure nodes')).not.toBeInTheDocument();
      expect(screen.queryByText('All nodes')).not.toBeInTheDocument();
    });

    it('renders worker nodes with correct security groups for hypershift', () => {
      renderComponent({ isHypershiftSelected: true });

      expect(screen.queryByText('Worker Group 1')).toBeInTheDocument();
      expect(screen.queryByText('Worker Group 2')).toBeInTheDocument();
      expect(screen.queryByText('Control Plane Group 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Infrastructure Group 1')).not.toBeInTheDocument();
    });

    it('renders nothing when hypershift is selected but no worker groups exist', () => {
      const formGroupsWithoutWorker = {
        ...defaultFormGroups,
        worker: [],
      };

      const { container } = renderComponent({
        isHypershiftSelected: true,
        formGroups: formGroupsWithoutWorker,
      });

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Non-hypershift scenarios', () => {
    describe('with applyControlPlaneToAll = false', () => {
      it('renders separate sections for control plane, infrastructure, and worker nodes', () => {
        renderComponent({
          isHypershiftSelected: false,
          formGroups: { ...defaultFormGroups, applyControlPlaneToAll: false },
        });

        expect(screen.getByText('Control plane nodes')).toBeInTheDocument();
        expect(screen.getByText('Infrastructure nodes')).toBeInTheDocument();
        expect(screen.getByText('Worker nodes')).toBeInTheDocument();
      });

      it('renders all node types with their respective security groups', () => {
        renderComponent({
          isHypershiftSelected: false,
          formGroups: { ...defaultFormGroups, applyControlPlaneToAll: false },
        });

        // Check that all security groups are rendered
        expect(screen.getByText('Control Plane Group 1')).toBeInTheDocument();
        expect(screen.getByText('Control Plane Group 2')).toBeInTheDocument();
        expect(screen.getByText('Infrastructure Group 1')).toBeInTheDocument();
        expect(screen.getByText('Worker Group 1')).toBeInTheDocument();
        expect(screen.getByText('Worker Group 2')).toBeInTheDocument();
      });

      it('does not render infrastructure section when infra groups are empty', () => {
        const formGroupsWithoutInfra = {
          ...defaultFormGroups,
          applyControlPlaneToAll: false,
          infra: [],
        };

        renderComponent({
          isHypershiftSelected: false,
          formGroups: formGroupsWithoutInfra,
        });

        expect(screen.getByText('Control plane nodes')).toBeInTheDocument();
        expect(screen.queryByText('Infrastructure nodes')).not.toBeInTheDocument();
        expect(screen.getByText('Worker nodes')).toBeInTheDocument();
      });

      it('does not render worker section when worker groups are empty', () => {
        const formGroupsWithoutWorker = {
          ...defaultFormGroups,
          applyControlPlaneToAll: false,
          worker: [],
        };

        renderComponent({
          isHypershiftSelected: false,
          formGroups: formGroupsWithoutWorker,
        });

        expect(screen.getByText('Control plane nodes')).toBeInTheDocument();
        expect(screen.getByText('Infrastructure nodes')).toBeInTheDocument();
        expect(screen.queryByText('Worker nodes')).not.toBeInTheDocument();
      });
    });

    describe('with applyControlPlaneToAll = true', () => {
      it('renders "All nodes" section instead of separate control plane section', () => {
        renderComponent({
          isHypershiftSelected: false,
          formGroups: { ...defaultFormGroups, applyControlPlaneToAll: true },
        });

        expect(screen.getByText('All nodes')).toBeInTheDocument();
        expect(screen.queryByText('Control plane nodes')).not.toBeInTheDocument();
        expect(screen.queryByText('Infrastructure nodes')).not.toBeInTheDocument();
        expect(screen.queryByText('Worker nodes')).not.toBeInTheDocument();
      });

      it('applies control plane groups to all nodes when applyControlPlaneToAll is true', () => {
        renderComponent({
          isHypershiftSelected: false,
          formGroups: { ...defaultFormGroups, applyControlPlaneToAll: true },
        });

        // Only control plane groups should be rendered under "All nodes"
        expect(screen.getByText('Control Plane Group 1')).toBeInTheDocument();
        expect(screen.getByText('Control Plane Group 2')).toBeInTheDocument();
        // Infrastructure and worker groups should not be rendered separately
        expect(screen.queryByText('Infrastructure Group 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Worker Group 1')).not.toBeInTheDocument();
      });
    });

    it('does not render control plane section when control plane groups are empty', () => {
      const formGroupsWithoutControlPlane = {
        ...defaultFormGroups,
        applyControlPlaneToAll: false,
        controlPlane: [],
      };

      renderComponent({
        isHypershiftSelected: false,
        formGroups: formGroupsWithoutControlPlane,
      });

      expect(screen.queryByText('Control plane nodes')).not.toBeInTheDocument();
      expect(screen.queryByText('All nodes')).not.toBeInTheDocument();
      expect(screen.getByText('Infrastructure nodes')).toBeInTheDocument();
      expect(screen.getByText('Worker nodes')).toBeInTheDocument();
    });
  });

  describe('Edge cases and conditional rendering', () => {
    it('renders nothing when all group arrays are empty', () => {
      const emptyFormGroups = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        infra: [],
        worker: [],
      };

      const { container } = renderComponent({
        isHypershiftSelected: false,
        formGroups: emptyFormGroups,
      });

      expect(container.firstChild).toBeNull();
    });

    it('handles null/undefined formGroups properties gracefully', () => {
      const incompleteFormGroups = {
        applyControlPlaneToAll: false,
        controlPlane: ['sg-control-1'],
        infra: [],
        worker: [],
      };

      expect(() => {
        renderComponent({
          isHypershiftSelected: false,
          formGroups: incompleteFormGroups,
        });
      }).not.toThrow();

      expect(screen.getByText('Control plane nodes')).toBeInTheDocument();
    });
  });

  describe('Integration with SecurityGroupsViewList', () => {
    it('passes built security groups to SecurityGroupsViewList components', () => {
      renderComponent({ isHypershiftSelected: false });

      // Check that security group names are displayed correctly
      expect(screen.getByText('Control Plane Group 1')).toBeInTheDocument();
      expect(screen.getByText('Control Plane Group 2')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure Group 1')).toBeInTheDocument();
      expect(screen.getByText('Worker Group 1')).toBeInTheDocument();
      expect(screen.getByText('Worker Group 2')).toBeInTheDocument();
    });

    it('handles security groups without names correctly', () => {
      const formGroupsWithUnknownSG = {
        ...defaultFormGroups,
        controlPlane: ['sg-unknown'],
      };

      renderComponent({
        isHypershiftSelected: false,
        formGroups: formGroupsWithUnknownSG,
      });

      // Should display the ID when name is empty
      expect(screen.getByText('sg-unknown')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations for hypershift scenario', async () => {
      const { container } = renderComponent({ isHypershiftSelected: true });

      await checkAccessibility(container);
    });

    it('has no accessibility violations for non-hypershift scenario', async () => {
      const { container } = renderComponent({ isHypershiftSelected: false });

      await checkAccessibility(container);
    });
  });
});
