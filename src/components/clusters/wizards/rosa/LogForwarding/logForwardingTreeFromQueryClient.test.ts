import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import {
  getLogForwardingTreeForClusterRequest,
  isRosaHcpLogForwardingSubmitContext,
} from './logForwardingTreeFromQueryClient';

jest.mock('~/components/App/queryClient', () => ({
  queryClient: {
    getQueryData: jest.fn(),
  },
}));

const { queryClient } = jest.requireMock('~/components/App/queryClient') as {
  queryClient: { getQueryData: jest.Mock };
};

const rosaHcpLogForwardingForm = {
  product: 'ROSA',
  cloud_provider: 'aws',
  hypershift: 'true',
  [FieldId.LogForwardingS3Enabled]: true,
  [FieldId.LogForwardingCloudWatchEnabled]: false,
};

describe('isRosaHcpLogForwardingSubmitContext', () => {
  it('is true when ROSA HCP AWS log forwarding is enabled', () => {
    expect(isRosaHcpLogForwardingSubmitContext({}, rosaHcpLogForwardingForm)).toBe(true);
  });

  it('is false when neither S3 nor CloudWatch is enabled', () => {
    expect(
      isRosaHcpLogForwardingSubmitContext(
        {},
        {
          ...rosaHcpLogForwardingForm,
          [FieldId.LogForwardingS3Enabled]: false,
        },
      ),
    ).toBe(false);
  });

  it('is false for non-HCP clusters', () => {
    expect(
      isRosaHcpLogForwardingSubmitContext(
        {},
        {
          ...rosaHcpLogForwardingForm,
          hypershift: 'false',
        },
      ),
    ).toBe(false);
  });

  it('is false for non-ROSA products', () => {
    expect(
      isRosaHcpLogForwardingSubmitContext(
        { product: 'OSD' },
        {
          ...rosaHcpLogForwardingForm,
          product: 'OSD',
        },
      ),
    ).toBe(false);
  });

  it('is false for non-AWS cloud providers', () => {
    expect(
      isRosaHcpLogForwardingSubmitContext(
        { cloudProviderID: 'gcp' },
        {
          ...rosaHcpLogForwardingForm,
          cloud_provider: 'gcp',
        },
      ),
    ).toBe(false);
  });
});

describe('getLogForwardingTreeForClusterRequest', () => {
  beforeEach(() => {
    queryClient.getQueryData.mockReset();
  });

  it('does not read the query cache when log forwarding submit context does not apply', () => {
    expect(
      getLogForwardingTreeForClusterRequest(
        {},
        {
          ...rosaHcpLogForwardingForm,
          [FieldId.LogForwardingS3Enabled]: false,
          [FieldId.LogForwardingCloudWatchEnabled]: false,
        },
      ),
    ).toBeUndefined();

    expect(queryClient.getQueryData).not.toHaveBeenCalled();
  });

  it('reads the query cache when log forwarding submit context applies', () => {
    queryClient.getQueryData.mockReturnValueOnce([{ id: 'api', text: 'API', children: [] }]);
    queryClient.getQueryData.mockReturnValueOnce([]);

    expect(getLogForwardingTreeForClusterRequest({}, rosaHcpLogForwardingForm)).toEqual([
      { id: 'api', text: 'API', children: [] },
    ]);
    expect(queryClient.getQueryData).toHaveBeenCalledTimes(2);
  });
});
