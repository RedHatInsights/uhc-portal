import { normalizedProducts } from '~/common/subscriptionTypes';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import {
  DEFAULT_NODE_COUNT_CUSTOMER_MULTI_AZ,
  DEFAULT_NODE_COUNT_CUSTOMER_SINGLE_AZ,
  DEFAULT_NODE_COUNT_REDHAT_MULTI_AZ,
  DEFAULT_NODE_COUNT_REDHAT_SINGLE_AZ,
} from '~/components/clusters/wizards/common/constants';

import getMinNodesAllowed, {
  computeNodeHintText,
  getMinReplicasCount,
  getNodesCount,
} from './AutoScaleHelper';

describe('AutoScaleHelper.js', () => {
  describe('getMinNodesAllowed', () => {
    const base = {
      isAutoscaleEnabled: false,
    };

    it('returns 0 when Hypershift wizard and autoscaling is enabled', () => {
      expect(
        getMinNodesAllowed({
          ...base,
          isHypershiftWizard: true,
          isAutoscaleEnabled: true,
          isDefaultMachinePool: true,
          product: normalizedProducts.OSD,
          isBYOC: false,
          isMultiAz: false,
        }),
      ).toBe(0);
    });

    it('uses BYOC or ROSA default pool minimums: 3 multi-AZ, 2 single-AZ', () => {
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: true,
          product: normalizedProducts.OSD,
          isBYOC: true,
          isMultiAz: true,
        }),
      ).toBe(3);
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: true,
          product: normalizedProducts.OSD,
          isBYOC: true,
          isMultiAz: false,
        }),
      ).toBe(2);
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: true,
          product: normalizedProducts.ROSA,
          isBYOC: false,
          isMultiAz: true,
        }),
      ).toBe(3);
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: true,
          product: normalizedProducts.ROSA,
          isBYOC: false,
          isMultiAz: false,
        }),
      ).toBe(2);
    });

    it('uses non-BYOC OSD default pool minimums: 9 multi-AZ, 4 single-AZ', () => {
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: true,
          product: normalizedProducts.OSD,
          isBYOC: false,
          isMultiAz: true,
        }),
      ).toBe(9);
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: true,
          product: normalizedProducts.OSD,
          isBYOC: false,
          isMultiAz: false,
        }),
      ).toBe(4);
    });

    it('uses defaultMinAllowed for non-default machine pools when it is the effective max', () => {
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: false,
          product: normalizedProducts.OSD,
          isBYOC: false,
          isMultiAz: true,
          defaultMinAllowed: 0,
        }),
      ).toBe(0);
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: false,
          product: normalizedProducts.OSD,
          isBYOC: false,
          isMultiAz: false,
          defaultMinAllowed: 7,
        }),
      ).toBe(7);
    });

    it('returns the greater of scaled autoScaleMinNodesValue and default-pool floor', () => {
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: true,
          product: normalizedProducts.OSD,
          isBYOC: false,
          isMultiAz: false,
          autoScaleMinNodesValue: 8,
        }),
      ).toBe(8);
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: true,
          product: normalizedProducts.OSD,
          isBYOC: false,
          isMultiAz: true,
          autoScaleMinNodesValue: 5,
        }),
      ).toBe(15);
    });

    it('multiplies autoScaleMinNodesValue by 3 for multi-AZ when not Hypershift before taking max', () => {
      expect(
        getMinNodesAllowed({
          ...base,
          isDefaultMachinePool: false,
          product: normalizedProducts.OSD,
          isBYOC: false,
          isMultiAz: true,
          autoScaleMinNodesValue: 2,
          defaultMinAllowed: 0,
        }),
      ).toBe(6);
    });

    it('does not multiply autoScaleMinNodesValue by 3 for multi-AZ when Hypershift wizard (autoscale off)', () => {
      expect(
        getMinNodesAllowed({
          ...base,
          isHypershiftWizard: true,
          isAutoscaleEnabled: false,
          isDefaultMachinePool: false,
          product: normalizedProducts.ROSA,
          isBYOC: true,
          isMultiAz: true,
          autoScaleMinNodesValue: 2,
          defaultMinAllowed: 0,
        }),
      ).toBe(2);
    });
  });

  describe('computeNodeHintText', () => {
    it('returns HCP wizard help text', () => {
      const isHypershiftWizard = true;
      const isAddEditHypershiftModal = false;
      expect(computeNodeHintText(isHypershiftWizard, isAddEditHypershiftModal)).toEqual(
        constants.hcpComputeNodeCountHintWizard,
      );

      expect(computeNodeHintText(isHypershiftWizard)).toEqual(
        constants.hcpComputeNodeCountHintWizard,
      );
    });

    it('returns HCP edit/add machine pool help text', () => {
      const isHypershiftWizard = false;
      const isAddEditHypershiftModal = true;
      expect(computeNodeHintText(isHypershiftWizard, isAddEditHypershiftModal)).toEqual(
        constants.hcpComputeNodeCountHint,
      );
    });

    it('returns classic/osd help text', () => {
      const isHypershiftWizard = false;
      const isAddEditHypershiftModal = false;
      expect(computeNodeHintText(isHypershiftWizard, isAddEditHypershiftModal)).toEqual(
        constants.computeNodeCountHint,
      );

      expect(computeNodeHintText()).toEqual(constants.computeNodeCountHint);
    });
  });

  describe('getNodesCount', () => {
    it('should return customer single AZ node count when isBYOC=true, isMultiAz=false', () => {
      const result = getNodesCount(true, false);
      expect(result).toBe(DEFAULT_NODE_COUNT_CUSTOMER_SINGLE_AZ);
    });

    it('should return customer multi AZ node count when isBYOC=true, isMultiAz=true', () => {
      const result = getNodesCount(true, true);
      expect(result).toBe(DEFAULT_NODE_COUNT_CUSTOMER_MULTI_AZ);
    });

    it('should return Red Hat single AZ node count when isBYOC=false, isMultiAz=false', () => {
      const result = getNodesCount(false, false);
      expect(result).toBe(DEFAULT_NODE_COUNT_REDHAT_SINGLE_AZ);
    });

    it('should return Red Hat multi AZ node count when isBYOC=false, isMultiAz=true', () => {
      const result = getNodesCount(false, true);
      expect(result).toBe(DEFAULT_NODE_COUNT_REDHAT_MULTI_AZ);
    });

    it('should return string when asString=true', () => {
      const result = getNodesCount(true, false, true);
      expect(result).toBe(`${DEFAULT_NODE_COUNT_CUSTOMER_SINGLE_AZ}`);
      expect(typeof result).toBe('string');
    });
  });

  describe('getMinReplicasCount', () => {
    it('returns expected value for BYOC multi AZ with HCP selected', () => {
      const expected = DEFAULT_NODE_COUNT_CUSTOMER_MULTI_AZ;
      const result = getMinReplicasCount(true, true, false, true);
      expect(result).toBe(expected);
    });

    it('returns expected integer value for Red Hat multi AZ', () => {
      const expected = DEFAULT_NODE_COUNT_REDHAT_MULTI_AZ / 3;
      const result = getMinReplicasCount(false, true, false, false);
      expect(result).toBe(expected);
      // multi-AZ 'OSD Red Hat managed cloud account', : should divide by 3 -> integer (3/3 = 1)
      expect(Number.isInteger(result)).toBe(true);
    });

    it('returns expected value for BYOC single AZ', () => {
      const expected = DEFAULT_NODE_COUNT_CUSTOMER_SINGLE_AZ;
      const result = getMinReplicasCount(true, false, false, false);
      expect(result).toBe(expected);
    });

    it('returns expected value for Red Hat single AZ', () => {
      const expected = DEFAULT_NODE_COUNT_REDHAT_SINGLE_AZ;
      const result = getMinReplicasCount(false, false, false, false);
      expect(result).toBe(expected);
    });

    it('returns expected integer value for multi-AZ "OSD BYOC|CCS" & "Rosa Classic"', () => {
      const expected = DEFAULT_NODE_COUNT_CUSTOMER_MULTI_AZ;
      const result = getMinReplicasCount(true, true, false, false);
      expect(result).toBe(expected);

      // multi-AZ 'OSD BYOC|CCS' & 'Rosa Classic' : should NOT divide by 3 -> could be non-integer if division applied
      // Here we assert the function keeps it integer (no division by 3)
      expect(Number.isInteger(result)).toBe(true);
    });

    it('returns string when asString=true', () => {
      const result = getMinReplicasCount(false, true, true, false);
      expect(result).toBe(`${DEFAULT_NODE_COUNT_REDHAT_MULTI_AZ / 3}`);
      expect(typeof result).toBe('string');
    });
  });
});
