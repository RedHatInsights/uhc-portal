import React from 'react';

import { checkAccessibility, render } from '~/testUtils';

import ClusterNetwork from '../components/Overview/ClusterNetwork';

import fixtures from './ClusterDetails.fixtures';

describe('<ClusterNetwork />', () => {
  it('is accessible', async () => {
    //  <dl> is added because this is displayed inside dl in the parent component.
    const { container } = render(
      <dl>
        <ClusterNetwork cluster={fixtures.clusterDetails.cluster} />
      </dl>,
    );
    await checkAccessibility(container);
  });
});
