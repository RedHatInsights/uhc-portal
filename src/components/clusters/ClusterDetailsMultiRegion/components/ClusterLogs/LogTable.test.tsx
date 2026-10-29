import React from 'react';

import { render, screen } from '~/testUtils';

import LogTable from './LogTable';

const standardLog = {
  cluster_id: '1tm6kbjkauh9inll0m89dcmoocjlvka3',
  cluster_uuid: '031fb349-fa84-421a-9c7a-af47e34559e1',
  created_at: '2022-10-05T15:30:23.844262Z',
  created_by: 'service-account-ocm-cs-production-2',
  description:
    "Add-on 'Red Hat OpenShift Database Access' was added and is awaiting installation.  For more information, see https://access.redhat.com/documentation/en-us/red_hat_openshift_service_on_aws/4/html/storage/configuring-persistent-storage",
  email: '',
  event_stream_id: '2FinYzqDtg2vb9hviy5CfTEJywq',
  first_name: '',
  href: '/api/service_logs/v1/cluster_logs/2FinYzoHohvd7d8VqauSpxS1jcJ',
  id: '2FinYzoHohvd7d8VqauSpxS1jcJ',
  internal_only: false,
  kind: 'ClusterLog',
  last_name: '',
  service_name: 'ClusterService',
  severity: 'Low',
  summary: "Add-on 'Red Hat OpenShift Database Access' is being installed",
  timestamp: '2022-10-05T15:30:23Z',
  username: 'dtaylor-ocm',
};

// new doc_references & log_type
const richLog = {
  cluster_id: '1tm6kbjkauh9inll0m89dcmoocjlvka3',
  cluster_uuid: '031fb349-fa84-421a-9c7a-af47e34559e1',
  created_at: '2022-10-05T15:30:23.844262Z',
  created_by: 'service-account-ocm-cs-production-2',
  description: "Add-on 'Red Hat OpenShift Database Access' was added and is awaiting installation",
  doc_references: ['https://access.redhat.com/documentation'],
  email: '',
  event_stream_id: '2FinYzqDtg2vb9hviy5CfTEJywq',
  first_name: '',
  href: '/api/service_logs/v1/cluster_logs/2FinYzoHohvd7d8VqauSpxS1jcJ',
  id: '2FinYzoHohvd7d8VqauSpxS1jcJ',
  internal_only: false,
  kind: 'ClusterLog',
  last_name: '',
  log_type: 'Capacity management',
  service_name: 'ClusterService',
  severity: 'Important',
  summary: "Add-on 'Red Hat OpenShift Database Access' is being installed",
  timestamp: '2022-10-05T15:30:23Z',
  username: 'dtaylor-ocm',
};

const defaultProps = {
  pending: false,
  setSorting: jest.fn(),
  refreshEvent: {
    type: 'foobar',
    reset: jest.fn(),
  },
};

describe('Doc References', () => {
  it('verifies References are displayed when log contains doc_references', async () => {
    // Arrange
    const newProps = {
      ...defaultProps,
      logs: [{ ...richLog }],
    };
    const { user } = render(<LogTable {...newProps} />);

    // Assert
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.getByTestId('references_0')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://access.redhat.com/documentation',
    );
  });
  it('verifies References are not displayed when do not exist', async () => {
    // Arrange
    const newProps = {
      ...defaultProps,
      logs: [{ ...standardLog }],
    };
    const { user } = render(<LogTable {...newProps} />);

    // Assert
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.queryByTestId('references_0')).not.toBeInTheDocument();
  });

  it('verifies urls in log descriptions render as ExternalLinks', async () => {
    // Arrange
    const newProps = {
      ...defaultProps,
      logs: [{ ...standardLog }],
    };
    const { user } = render(<LogTable {...newProps} />);

    // Assert
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.queryByTestId('openInNewWindowIcon')).toBeInTheDocument();
  });
});
