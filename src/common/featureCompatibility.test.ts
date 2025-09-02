import { normalizedProducts } from '~/common/subscriptionTypes';
import { ClusterFromSubscription } from '~/types/types';

import { isCompatibleFeature, SupportedFeature } from './featureCompatibility';

describe('isCompatibleFeature', () => {
  describe('Security groups', () => {
    const checkCompatibility = (testCluster: Partial<ClusterFromSubscription>) =>
      isCompatibleFeature(SupportedFeature.SECURITY_GROUPS, testCluster);
    describe('are incompatible for', () => {
      it.each([
        ['Hypershift enabled', { hypershift: { enabled: true } }],
        ['Hypershift not enabled', { hypershift: { enabled: false } }],
        [
          'ROSA GCP + BYOVPC',
          {
            product: { id: normalizedProducts.ROSA },
            cloud_provider: { id: 'gcp' },
            gcp_network: { vpc_name: 'gcp-vpc' },
          },
        ],
        [
          'ROSA GCP + non-BYOVPC',
          {
            product: { id: normalizedProducts.ROSA },
            cloud_provider: { id: 'gcp' },
            gcp_network: undefined,
          },
        ],
        [
          'ROSA AWS + non-BYOVPC',
          {
            product: { id: normalizedProducts.ROSA },
            cloud_provider: { id: 'aws' },
            aws: { subnet_ids: undefined },
          },
        ],
      ])(
        '"%s" clusters',
        (_clusterDesc: string, clusterSettings: Partial<ClusterFromSubscription>) => {
          expect(checkCompatibility(clusterSettings)).toBeFalsy();
        },
      );
    });

    describe('are compatible for', () => {
      it.each([
        [
          'Day2 ROSA AWS + BYOVPC + STS',
          {
            product: { id: normalizedProducts.ROSA },
            cloud_provider: { id: 'aws' },
            aws: {
              subnet_ids: ['subnet-private-id'],
              sts: { role_arn: 'role-arn' },
            },
          },
        ],
        [
          'Day2 OSD AWS + BYOVPC + STS',
          {
            product: { id: normalizedProducts.OSD },
            cloud_provider: { id: 'aws' },
            aws: {
              subnet_ids: ['subnet-private-id'],
              sts: { role_arn: 'role-arn' },
            },
          },
        ],
        [
          'Day2 + ROSA AWS + BYOVPC + non-STS',
          {
            product: { id: normalizedProducts.ROSA },
            cloud_provider: { id: 'aws' },
            aws: {
              subnet_ids: ['subnet-private-id'],
              sts: undefined,
            },
          },
        ],
        [
          'Day2 + OSD AWS + BYOVPC + non-STS',
          {
            product: { id: normalizedProducts.OSD },
            cloud_provider: { id: 'aws' },
            aws: {
              subnet_ids: ['subnet-private-id'],
              sts: undefined,
            },
          },
        ],
        [
          'Day1 setup',
          {
            product: { id: normalizedProducts.ROSA },
            cloud_provider: { id: 'aws' },
            aws: {
              subnet_ids: ['subnet-private-id'],
              sts: { role_arn: 'role-arn' },
            },
          },
        ],
      ])(
        '"%s" clusters',
        (_clusterDesc: string, clusterSettings: Partial<ClusterFromSubscription>) => {
          expect(checkCompatibility(clusterSettings)).toBeTruthy();
        },
      );
    });
  });
  describe('Auto Cluster Transfer Ownership', () => {
    const checkCompatibility = (testCluster: Partial<ClusterFromSubscription>) =>
      isCompatibleFeature(SupportedFeature.AUTO_CLUSTER_TRANSFER_OWNERSHIP, testCluster);
    describe('are incompatible for', () => {
      it.each([
        [
          'Hypershift enabled',
          { product: { id: normalizedProducts.ROSA }, hypershift: { enabled: true } },
          false,
        ],
        [
          'ROSA, not Hypershift',
          { product: { id: normalizedProducts.ROSA }, hypershift: { enabled: false } },
          true,
        ],
        ['ROSA_HyperShift', { product: { id: normalizedProducts.ROSA_HyperShift } }, false],
        ['OCP', { product: { id: normalizedProducts.OCP } }, false],
        ['OSD', { product: { id: normalizedProducts.OSD } }, false],
      ])(
        '"%s" clusters',
        (
          _clusterDesc: string,
          clusterSettings: Partial<ClusterFromSubscription>,
          result: boolean,
        ) => {
          expect(checkCompatibility(clusterSettings)).toEqual(result);
        },
      );
    });
  });
});
