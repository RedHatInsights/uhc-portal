import React from 'react';

import { render, screen } from '~/testUtils';

import { mockedClusters } from './mocks/clusterListTable.mock';
import ClusterListTable from './ClusterListTable';

const initialProps = {
  clusters: mockedClusters,
  openModal: () => {},
  isPending: false,
  refreshFunc: () => {},
  isClustersDataPending: false,
};

describe('<ClusterListTable />', () => {
  it('shows skeletons when is pending ', () => {
    const newProps = { ...initialProps, isPending: true };
    render(<ClusterListTable {...newProps} />);
    expect(screen.getAllByText('loading cluster')).toHaveLength(10);
    expect(screen.queryByText('myAWSCluster')).not.toBeInTheDocument();
    expect(screen.queryByText('No clusters found.')).not.toBeInTheDocument();
  });

  it('omits column headers while pending with no clusters (initial load / reload)', () => {
    render(<ClusterListTable {...initialProps} isPending clusters={[]} refreshFunc={() => {}} />);
    expect(screen.getByTestId('clusterListTableBody')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    expect(screen.getAllByText('loading cluster')).toHaveLength(10);
  });

  it('shows empty state when there are no clusters and it is no longer pending', () => {
    const newProps = { ...initialProps, isPending: false, clusters: [] };
    render(<ClusterListTable {...newProps} />);
    expect(screen.getByText('No clusters found.')).toBeInTheDocument();
    expect(screen.queryByText('loading cluster')).not.toBeInTheDocument();
    expect(screen.queryByText('myAWSCluster')).not.toBeInTheDocument();
  });

  it('show status when still fetching cluster details but status is  known', () => {
    const newProps = {
      ...initialProps,
      isClustersDataPending: true,
      clusters: [{ ...mockedClusters[0] }],
    };
    render(<ClusterListTable {...newProps} />);

    const dataRow = screen.getAllByRole('row')[1];
    const statusCell = dataRow.getElementsByTagName('td')[1];

    // This is actually the aria text for the skeleton
    expect(statusCell).toHaveTextContent('loading cluster status');
  });

  it('shows unknown status when fetching cluster details is done but status is not known', () => {
    const newProps = {
      ...initialProps,
      isClustersDataPending: false,
      clusters: [{ ...mockedClusters[0], state: undefined }],
    };
    render(<ClusterListTable {...newProps} />);

    const dataRow = screen.getAllByRole('row')[1];
    const statusCell = dataRow.getElementsByTagName('td')[1];
    expect(statusCell).toHaveTextContent('');

    expect(statusCell.querySelector('[ data-icon-type="unknown"]')).toBeInTheDocument();
  });

  describe('cluster name', () => {
    it('shows cluster name', () => {
      const newProps = {
        ...initialProps,

        clusters: [{ ...mockedClusters[0] }],
      };

      const displayName = mockedClusters[0].subscription.display_name;

      render(<ClusterListTable {...newProps} />);

      const row = screen.getAllByRole('row')[1];
      const nameCell = row.getElementsByTagName('td')[0];

      expect(nameCell).toHaveTextContent(displayName);
    });

    it('shows skeleton if cluster name is unknown and cluster information is still loading', () => {
      const unNamedCluster = { ...mockedClusters[0] };
      // @ts-ignore - This normally wouldn't happen, but the code checks for undefined
      unNamedCluster.subscription.display_name = undefined;
      // @ts-ignore- This normally wouldn't happen, but the code checks for undefined
      unNamedCluster.subscription.id = undefined;

      const newProps = {
        ...initialProps,
        clusters: [unNamedCluster],
        isClustersDataPending: true,
      };
      render(<ClusterListTable {...newProps} />);

      const row = screen.getAllByRole('row')[1];
      const nameCell = row.getElementsByTagName('td')[0];

      // NOTE: This is actually the screen-reader text of the skeleton
      expect(nameCell).toHaveTextContent('loading cluster name');
    });

    it('shows default text if cluster name is not known and loading is complete', () => {
      const unNamedCluster = { ...mockedClusters[0] };
      // @ts-ignore - This normally wouldn't happen, but the code checks for undefined
      unNamedCluster.subscription.display_name = undefined;
      // @ts-ignore- This normally wouldn't happen, but the code checks for undefined
      unNamedCluster.subscription.id = undefined;

      const newProps = {
        ...initialProps,
        clusters: [unNamedCluster],
        isClustersDataPending: false,
      };
      render(<ClusterListTable {...newProps} />);

      const row = screen.getAllByRole('row')[1];
      const nameCell = row.getElementsByTagName('td')[0];

      expect(nameCell).toHaveTextContent('Unnamed Cluster');
    });
  });
});
