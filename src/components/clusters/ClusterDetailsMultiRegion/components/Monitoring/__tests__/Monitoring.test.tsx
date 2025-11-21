import React from 'react';

import { checkAccessibility, render } from '~/testUtils';

import Monitoring from '../Monitoring';
import { monitoringStatuses } from '../monitoringHelper';

import { mockOCPActiveClusterDetails } from './Monitoring.fixtures';

describe('<Monitoring />', () => {
  const defaultProps = {
    cluster: mockOCPActiveClusterDetails,
  };

  it.each(Object.keys(monitoringStatuses))('is accessible with health status %s', async () => {
    const { container } = render(<Monitoring {...defaultProps} />);
    await checkAccessibility(container);
  });
});
