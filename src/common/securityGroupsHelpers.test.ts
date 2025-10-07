import { hasSecurityGroupIds, hasSelectedSecurityGroups } from './securityGroupsHelpers';

describe('hasSelectedSecurityGroups', () => {
  describe('when controlPlane groups apply to all node types', () => {
    it('returns true when at least one controlPlane group is selected', () => {
      const sgs = {
        applyControlPlaneToAll: true,
        controlPlane: ['sg-abc'],
        worker: [],
        infra: [],
      };
      expect(hasSelectedSecurityGroups(sgs)).toEqual(true);
    });
    it('returns false when no controlPlane groups are selected', () => {
      const sgs = {
        applyControlPlaneToAll: true,
        controlPlane: [],
        worker: ['sg-this-group-will-be-ignored'],
        infra: [],
      };
      expect(hasSelectedSecurityGroups(sgs)).toEqual(false);
    });
  });

  describe('when each node type defines its own groups', () => {
    it('returns true when there is at least one security group for controlPlane nodes', () => {
      const sgs = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        worker: [],
        infra: ['sg-abc'],
      };
      expect(hasSelectedSecurityGroups(sgs)).toEqual(true);
    });
    it('returns true when there is at least one security group for infra nodes', () => {
      const sgs = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        worker: [],
        infra: ['sg-abc'],
      };
      expect(hasSelectedSecurityGroups(sgs)).toEqual(true);
    });
    it('returns true when there is at least one security group for worker nodes', () => {
      const sgs = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        worker: [],
        infra: ['sg-abc'],
      };
      expect(hasSelectedSecurityGroups(sgs)).toEqual(true);
    });
    it('returns true when none of the node types has any security groups', () => {
      const sgs = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        worker: [],
        infra: [],
      };
      expect(hasSelectedSecurityGroups(sgs)).toEqual(false);
    });
  });
  describe('when hypershift is selected', () => {
    it('returns true when there is at least one security group for worker nodes', () => {
      const sgs = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        worker: ['sg-abc'],
        infra: [],
      };
      expect(hasSelectedSecurityGroups(sgs, true)).toEqual(true);
    });
    it('returns false when there is no security group for worker nodes', () => {
      const sgs = {
        applyControlPlaneToAll: false,
        controlPlane: [],
        worker: [],
        infra: [],
      };
      expect(hasSelectedSecurityGroups(sgs, true)).toEqual(false);
    });
  });
});
describe('hasSecurityGroupIds', () => {
  describe('when controlPlane security groupIds exist', () => {
    it('returns true when at least one controlPlane groupId exist', () => {
      const cluster = {
        aws: {
          additional_control_plane_security_group_ids: ['sg-abc'],
        },
      };

      expect(hasSecurityGroupIds(cluster, [])).toEqual(true);
    });
    it('returns false when no controlPlane groupIds exist', () => {
      const cluster = {
        aws: {
          additional_control_plane_security_group_ids: [],
        },
      };

      expect(hasSecurityGroupIds(cluster, [])).toEqual(false);
    });
  });

  describe('when Infrastructure security groupIds exist', () => {
    it('returns true when at least one infra groupId exist', () => {
      const cluster = {
        aws: {
          additional_infra_security_group_ids: ['sg-abc'],
        },
      };

      expect(hasSecurityGroupIds(cluster, [])).toEqual(true);
    });
    it('returns false when no infra groupIds exist', () => {
      const cluster = {
        aws: {
          additional_infra_security_group_ids: [],
        },
      };

      expect(hasSecurityGroupIds(cluster, [])).toEqual(false);
    });
    it('returns false when cluster undefined', () => {
      expect(hasSecurityGroupIds()).toEqual(false);
    });
  });

  describe('when MachinePools security groupIds exist', () => {
    it('returns true when at least one machine pool security groupId exist', () => {
      const machinePools = [
        {
          aws: {
            additional_security_group_ids: [],
          },
        },
        {
          aws: {
            additional_security_group_ids: [],
          },
        },
        {
          aws: {
            additional_security_group_ids: ['sg-abc'],
          },
        },
      ];

      expect(hasSecurityGroupIds({}, machinePools)).toEqual(true);
    });
    it('returns false when no machine pool security groupIds exist', () => {
      const machinePools = [
        {
          aws: {
            additional_security_group_ids: [],
          },
        },
        {
          aws: {
            additional_security_group_ids: [],
          },
        },
        {
          aws: {
            additional_security_group_ids: [],
          },
        },
      ];

      expect(hasSecurityGroupIds({}, machinePools)).toEqual(false);
    });
    it('returns false when machine pools is undefined', () => {
      expect(hasSecurityGroupIds({}, undefined)).toEqual(false);
    });
  });
});
