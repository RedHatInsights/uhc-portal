import React from 'react';

import docLinks from '~/common/docLinks.mjs';
import supportLinks from '~/common/supportLinks.mjs';
import { render, screen } from '~/testUtils';

import HibernateClusterContent from './HibernateClusterContent';

describe('HibernateClusterContent', () => {
  const clusterName = 'test-cluster';
  const linkText = /Learn more about cluster hibernation/;

  it.each([
    [false, false, docLinks.OCP_HIBERNATING_CLUSTER],
    [false, true, docLinks.OCP_HIBERNATING_CLUSTER],
    [true, false, supportLinks.HIBERNATING_CLUSTER],
    [true, true, supportLinks.HIBERNATING_CLUSTER],
  ])(
    'renders expected doc link when isROSA is %s and isHibernating is %s',
    (isROSA, isHibernating, expectedHref) => {
      render(
        <HibernateClusterContent
          clusterName={clusterName}
          isHibernating={isHibernating}
          isROSA={isROSA}
        />,
      );

      expect(screen.getByText(linkText)).toHaveAttribute('href', expectedHref);
    },
  );
});
