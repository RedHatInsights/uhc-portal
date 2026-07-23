import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { MAX_NODES, MAX_NODES_INSUFFICIEN_VERSION } from '../machinePools/constants';

import { MaxNodesTotalPopover, MaxNodesTotalPopoverText } from './MaxNodesTotalTooltip';

describe('<MaxNodesTotalPopoverText />', () => {
  it('is accessible', async () => {
    const { container } = render(<MaxNodesTotalPopoverText />);

    await checkAccessibility(container);
  });
});

describe('<MaxNodesTotalPopover />', () => {
  it('displays the max-nodes-total explanation when the info button is clicked', async () => {
    const { user } = render(<MaxNodesTotalPopover />);

    await user.click(screen.getByLabelText('More information'));

    expect(screen.getByText('3 master nodes')).toBeInTheDocument();
    expect(
      screen.getByText('2 (single AZ) or 3 infrastructure nodes (multiple AZ)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Maximum worker node count')).toBeInTheDocument();
    expect(screen.getByText(String(MAX_NODES_INSUFFICIEN_VERSION))).toBeInTheDocument();
    expect(screen.getByText('for clusters below Openshift v4.14.14')).toBeInTheDocument();
    expect(screen.getByText(String(MAX_NODES))).toBeInTheDocument();
    expect(screen.getByText('for clusters at or above Openshift v4.14.14')).toBeInTheDocument();
  });
});
