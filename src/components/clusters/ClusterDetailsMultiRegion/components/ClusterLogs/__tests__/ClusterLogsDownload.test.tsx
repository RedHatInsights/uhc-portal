import React from 'react';
import { AxiosResponse } from 'axios';

import { serviceLogService } from '~/services';
import { render, screen, waitFor } from '~/testUtils';
import { ClusterLogList } from '~/types/service_logs.v1';
import { ViewOptions } from '~/types/types';

import ClusterLogsDownload from '../toolbar/ClusterLogsDownload';

import fixtures from './ClusterLogs.fixtures';

const mockLogService = (region?: string) => {
  const mock = region
    ? jest.spyOn(serviceLogService, 'getClusterHistoryForRegion')
    : jest.spyOn(serviceLogService, 'getClusterHistory');

  mock.mockReturnValue(
    Promise.resolve({
      data: [] as any as ClusterLogList,
    } as AxiosResponse<ClusterLogList, any>),
  );
  return mock;
};

const mockProps = {
  externalClusterID: fixtures[0].cluster_uuid,
  clusterID: fixtures[0].cluster_id,
  viewOptions: { sorting: { sortField: '' } } as ViewOptions,
  logs: 1,
};

(window as any).URL = {
  createObjectURL: jest.fn(),
};

describe('<ClusterLogsDownload />', () => {
  it('Calls log service on Download click', async () => {
    const mockDownloadClusterLogs = mockLogService();
    const { user } = render(<ClusterLogsDownload {...mockProps} />);
    await user.click(screen.getByTestId('download-btn'));

    await user.click(screen.getByTestId('submit-btn'));
    await waitFor(() => expect(screen.queryByTestId('submit-btn')).not.toBeInTheDocument());
    expect(mockDownloadClusterLogs).toHaveBeenCalledWith(
      fixtures[0].cluster_uuid,
      fixtures[0].cluster_id,
      {
        page: 1,
        page_size: -1,
        format: 'json',
        order: ' desc',
      },
    );
  });

  it('Calls regional log service on Download click', async () => {
    const regionId = 'aws.ap-southeast-1.stage';
    const mockDownloadClusterLogs = mockLogService(regionId);
    const newProps = { ...mockProps, region: regionId };
    const { user } = render(<ClusterLogsDownload {...newProps} />);
    await user.click(screen.getByTestId('download-btn'));

    await user.click(screen.getByTestId('submit-btn'));
    await waitFor(() => expect(screen.queryByTestId('submit-btn')).not.toBeInTheDocument());
    expect(mockDownloadClusterLogs).toHaveBeenCalledWith(
      fixtures[0].cluster_uuid,
      fixtures[0].cluster_id,
      {
        page: 1,
        page_size: -1,
        format: 'json',
        order: ' desc',
      },
      regionId,
    );
  });
});
