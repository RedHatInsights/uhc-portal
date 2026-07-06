import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { normalizedProducts } from '~/common/subscriptionTypes';
import * as reduxHooks from '~/redux/hooks';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import useCanClusterAutoscale from '../useCanClusterAutoscale';

const useGlobalStateMock = jest.spyOn(reduxHooks, 'useGlobalState');

describe('canAutoScale', () => {
  it('should allow autoscaling for ROSA clusters', () => {
    useGlobalStateMock.mockReturnValue(false);
    const result = useCanClusterAutoscale(
      normalizedProducts.ROSA,
      SubscriptionCommonFieldsClusterBillingModel.marketplace_aws,
    );
    expect(result).toBe(true);
  });

  it('should allow autoscaling for OSD clusters with standard billing account', () => {
    useGlobalStateMock.mockReturnValue(true);
    const result = useCanClusterAutoscale(
      normalizedProducts.OSD,
      SubscriptionCommonFieldsClusterBillingModel.standard,
    );
    expect(result).toBe(true);
  });

  it('should not allow autoscaling for OCP cluster', () => {
    useGlobalStateMock.mockReturnValue(false);
    const result = useCanClusterAutoscale(normalizedProducts.OCP, undefined);
    expect(result).toBe(false);
  });

  it('should not allow autoscaling for ARO clusters', () => {
    useGlobalStateMock.mockReturnValue(false);
    const result = useCanClusterAutoscale(normalizedProducts.ARO, undefined);
    expect(result).toBe(false);
  });

  it('should allow autoscaling for GCP-marketplace clusters', () => {
    useGlobalStateMock.mockReturnValue(false);
    const result = useCanClusterAutoscale(
      normalizedProducts.OSD,
      SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp,
    );
    expect(result).toBe(true);
  });

  it('should not allow autoscaling for non marketplace clusters without autoscale capability', () => {
    useGlobalStateMock.mockReturnValue(false);
    const result = useCanClusterAutoscale(
      normalizedProducts.OSD,
      SubscriptionCommonFieldsClusterBillingModel.standard,
    );
    expect(result).toBe(false);
  });

  it('should allow autoscaling when there is a cluster level autosacle capability', () => {
    useGlobalStateMock.mockReturnValue(false);
    const mockCapabilites = [
      { name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'true', inherited: true },
      { name: 'capability.cluster.cluster', value: 'true', inherited: false },
    ];
    const result = useCanClusterAutoscale(
      normalizedProducts.OSD,
      SubscriptionCommonFieldsClusterBillingModel.standard,
      mockCapabilites,
    );
    expect(result).toBe(false);
  });
});
