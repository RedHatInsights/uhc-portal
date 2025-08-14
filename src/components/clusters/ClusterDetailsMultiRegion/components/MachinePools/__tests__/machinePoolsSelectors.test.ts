import { OrganizationState } from '~/redux/reducers/userReducer';
import { baseRequestState } from '~/redux/reduxHelpers';
import { PromiseReducerState } from '~/redux/state';
import { MachineType } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import {
  hasMachinePoolsQuotaSelector,
  hasOrgLevelAutoscaleCapability,
  hasOrgLevelBypassPIDsLimitCapability,
} from '../machinePoolsSelectors';

import { stateWithNoQuota, stateWithQuota } from './MachinePools.fixtures';

describe('machinePoolsSelector', () => {
  const stateWithoutAutoscaleCapability = {
    userProfile: {
      organization: {
        details: {
          capabilities: [
            { name: 'capability.account.create_moa_clusters', value: 'true', inherited: false },
            { name: 'capability.account.allow_etcd_encryption', value: 'false', inherited: false },
            { name: 'capability.cluster.autoscale_clusters', value: 'false', inherited: false },
            { name: 'capability.cluster.subscribed_ocp', value: 'true', inherited: false },
          ],
        },
      },
    },
  };

  const stateWithAutoscaleCapability = {
    userProfile: {
      organization: {
        details: {
          capabilities: [
            { name: 'capability.account.create_moa_clusters', value: 'true', inherited: false },
            { name: 'capability.account.allow_etcd_encryption', value: 'false', inherited: false },
            { name: 'capability.cluster.autoscale_clusters', value: 'true', inherited: false },
            { name: 'capability.cluster.subscribed_ocp', value: 'true', inherited: false },
          ],
        },
      },
    },
  };

  it('should return false when quota is not fetched yet', () =>
    expect(hasMachinePoolsQuotaSelector(baseRequestState, undefined, undefined)).toBe(false));

  it('should return true when user has quota for additional machine pools', () =>
    expect(
      hasMachinePoolsQuotaSelector(
        stateWithQuota.userProfile.organization as PromiseReducerState<OrganizationState>,
        stateWithQuota.clusters.details.cluster as any as ClusterFromSubscription,
        stateWithQuota.machineTypes.types as { [id: string]: MachineType[] },
      ),
    ).toBe(true));

  it('should return false when user has no quota for additional machine pools', () =>
    expect(
      hasMachinePoolsQuotaSelector(
        stateWithNoQuota.userProfile.organization as PromiseReducerState<OrganizationState>,
        stateWithNoQuota.clusters.details.cluster as any as ClusterFromSubscription,
        stateWithNoQuota.machineTypes.types as { [id: string]: MachineType[] },
      ),
    ).toBe(false));

  it('should return true when org users can set autoscaling', () =>
    expect(
      hasOrgLevelAutoscaleCapability(stateWithAutoscaleCapability.userProfile.organization.details),
    ).toBe(true));

  it('should return false when org users cannot set autoscaling', () =>
    expect(
      hasOrgLevelAutoscaleCapability(
        stateWithoutAutoscaleCapability.userProfile.organization.details,
      ),
    ).toBe(false));

  describe('hasOrgLevelBypassPIDsLimitCapability', () => {
    it.each([
      ['returns true if the capability is present', 'true', true],
      ['returns false if the capability is absent', 'false', false],
    ])('%p', (title, capabilityValue, expected) => {
      // Arrange
      const organization = {
        capabilities: [
          {
            name: 'capability.organization.bypass_pids_limits',
            value: capabilityValue,
            inherited: false,
          },
        ],
      };

      // Act
      const result = hasOrgLevelBypassPIDsLimitCapability(organization);

      // Assert
      expect(result).toBe(expected);
    });

    it('returns false if the state is undefined', () =>
      expect(hasOrgLevelBypassPIDsLimitCapability(undefined)).toBe(false));
  });
});
