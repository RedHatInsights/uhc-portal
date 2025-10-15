import { createSecurityGroupsParams } from './submitOSDRequestHelper';

describe('createSecurityGroupsParams', () => {
  describe('Edge cases and null handling', () => {
    it('returns undefined when securityGroups is null', () => {
      const result = createSecurityGroupsParams(null, false);
      expect(result).toBeUndefined();
    });

    it('returns undefined when securityGroups is undefined', () => {
      const result = createSecurityGroupsParams(undefined, false);
      expect(result).toBeUndefined();
    });

    it('returns undefined when securityGroups is falsy', () => {
      const result = createSecurityGroupsParams('', false);
      expect(result).toBeUndefined();
    });
  });

  describe('Hypershift scenarios', () => {
    it('returns worker security groups for hypershift when worker array has values', () => {
      const securityGroups = {
        worker: ['sg-worker-1', 'sg-worker-2'],
        controlPlane: ['sg-control-1'],
        infra: ['sg-infra-1'],
        applyControlPlaneToAll: false,
      };

      const result = createSecurityGroupsParams(securityGroups, true);

      expect(result).toEqual({
        additional_compute_security_group_ids: ['sg-worker-1', 'sg-worker-2'],
      });
    });

    it('returns undefined for hypershift when worker array is empty', () => {
      const securityGroups = {
        worker: [],
        controlPlane: ['sg-control-1'],
        infra: ['sg-infra-1'],
        applyControlPlaneToAll: false,
      };

      const result = createSecurityGroupsParams(securityGroups, true);

      expect(result).toBeUndefined();
    });

    it('returns undefined for hypershift when worker is undefined', () => {
      const securityGroups = {
        controlPlane: ['sg-control-1'],
        infra: ['sg-infra-1'],
        applyControlPlaneToAll: false,
      };

      const result = createSecurityGroupsParams(securityGroups, true);

      expect(result).toBeUndefined();
    });

    it('ignores other security group types for hypershift', () => {
      const securityGroups = {
        worker: ['sg-worker-1'],
        controlPlane: ['sg-control-1', 'sg-control-2'],
        infra: ['sg-infra-1', 'sg-infra-2'],
        applyControlPlaneToAll: true,
      };

      const result = createSecurityGroupsParams(securityGroups, true);

      expect(result).toEqual({
        additional_compute_security_group_ids: ['sg-worker-1'],
      });
    });
  });

  describe('Non-hypershift scenarios with applyControlPlaneToAll = true', () => {
    it('applies control plane security groups to all node types when applyControlPlaneToAll is true', () => {
      const securityGroups = {
        applyControlPlaneToAll: true,
        controlPlane: ['sg-control-1', 'sg-control-2'],
        infra: ['sg-infra-1'],
        worker: ['sg-worker-1'],
      };

      const result = createSecurityGroupsParams(securityGroups, false);

      expect(result).toEqual({
        additional_control_plane_security_group_ids: ['sg-control-1', 'sg-control-2'],
        additional_infra_security_group_ids: ['sg-control-1', 'sg-control-2'],
        additional_compute_security_group_ids: ['sg-control-1', 'sg-control-2'],
      });
    });

    it('falls through to individual node processing when applyControlPlaneToAll is true but controlPlane array is empty', () => {
      const securityGroups = {
        applyControlPlaneToAll: true,
        controlPlane: [],
        infra: ['sg-infra-1'],
        worker: ['sg-worker-1'],
      };

      const result = createSecurityGroupsParams(securityGroups, false);

      expect(result).toEqual({
        additional_infra_security_group_ids: ['sg-infra-1'],
        additional_compute_security_group_ids: ['sg-worker-1'],
      });
    });

    it('throws error when applyControlPlaneToAll is true but controlPlane is undefined', () => {
      const securityGroups = {
        applyControlPlaneToAll: true,
        infra: ['sg-infra-1'],
        worker: ['sg-worker-1'],
      };

      expect(() => {
        createSecurityGroupsParams(securityGroups, false);
      }).toThrow("Cannot read properties of undefined (reading 'length')");
    });

    it('ignores infra and worker arrays when applyControlPlaneToAll is true', () => {
      const securityGroups = {
        applyControlPlaneToAll: true,
        controlPlane: ['sg-control-1'],
        infra: ['sg-infra-1', 'sg-infra-2', 'sg-infra-3'],
        worker: ['sg-worker-1', 'sg-worker-2'],
      };

      const result = createSecurityGroupsParams(securityGroups, false);

      expect(result).toEqual({
        additional_control_plane_security_group_ids: ['sg-control-1'],
        additional_infra_security_group_ids: ['sg-control-1'],
        additional_compute_security_group_ids: ['sg-control-1'],
      });
    });
  });

  describe('Non-hypershift scenarios with applyControlPlaneToAll = false', () => {
    it('assigns security groups to individual node types', () => {
      const securityGroups = {
        applyControlPlaneToAll: false,
        controlPlane: ['sg-control-1', 'sg-control-2'],
        infra: ['sg-infra-1'],
        worker: ['sg-worker-1', 'sg-worker-2'],
      };

      const result = createSecurityGroupsParams(securityGroups, false);

      expect(result).toEqual({
        additional_control_plane_security_group_ids: ['sg-control-1', 'sg-control-2'],
        additional_infra_security_group_ids: ['sg-infra-1'],
        additional_compute_security_group_ids: ['sg-worker-1', 'sg-worker-2'],
      });
    });

    it('only includes node types with non-empty arrays', () => {
      const securityGroups = {
        applyControlPlaneToAll: false,
        controlPlane: ['sg-control-1'],
        infra: [],
        worker: ['sg-worker-1'],
      };

      const result = createSecurityGroupsParams(securityGroups, false);

      expect(result).toEqual({
        additional_control_plane_security_group_ids: ['sg-control-1'],
        additional_compute_security_group_ids: ['sg-worker-1'],
      });
    });

    it('handles only control plane security groups', () => {
      const securityGroups = {
        applyControlPlaneToAll: false,
        controlPlane: ['sg-control-1', 'sg-control-2'],
        infra: [],
        worker: [],
      };

      const result = createSecurityGroupsParams(securityGroups, false);

      expect(result).toEqual({
        additional_control_plane_security_group_ids: ['sg-control-1', 'sg-control-2'],
      });
    });

    it('handles only infra security groups', () => {
      const securityGroups = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        infra: ['sg-infra-1', 'sg-infra-2'],
        worker: [],
      };

      const result = createSecurityGroupsParams(securityGroups, false);

      expect(result).toEqual({
        additional_infra_security_group_ids: ['sg-infra-1', 'sg-infra-2'],
      });
    });

    it('handles only worker security groups', () => {
      const securityGroups = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        infra: [],
        worker: ['sg-worker-1', 'sg-worker-2'],
      };

      const result = createSecurityGroupsParams(securityGroups, false);

      expect(result).toEqual({
        additional_compute_security_group_ids: ['sg-worker-1', 'sg-worker-2'],
      });
    });

    it('returns undefined when all node type arrays are empty', () => {
      const securityGroups = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        infra: [],
        worker: [],
      };

      const result = createSecurityGroupsParams(securityGroups, false);

      expect(result).toBeUndefined();
    });

    it('throws error when node type properties are missing', () => {
      const securityGroups = {
        applyControlPlaneToAll: false,
        controlPlane: ['sg-control-1'],
        // infra and worker are missing
      };

      expect(() => {
        createSecurityGroupsParams(securityGroups, false);
      }).toThrow("Cannot read properties of undefined (reading 'length')");
    });
  });
});
