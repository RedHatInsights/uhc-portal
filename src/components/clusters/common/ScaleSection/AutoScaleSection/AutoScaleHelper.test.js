import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import {
  DEFAULT_NODE_COUNT_CUSTOMER_MULTI_AZ,
  DEFAULT_NODE_COUNT_CUSTOMER_SINGLE_AZ,
  DEFAULT_NODE_COUNT_REDHAT_MULTI_AZ,
  DEFAULT_NODE_COUNT_REDHAT_SINGLE_AZ,
} from '~/components/clusters/wizards/common/constants';

import { computeNodeHintText, getNodesCount } from './AutoScaleHelper';

describe('AutoScaleHelper.js', () => {
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
});
