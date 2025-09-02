import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import links from '../../../common/installLinks.mjs';

import LocalTab from './LocalTab';

describe('<LocalTab />', () => {
  it('Verify "For more information about Openshift Local support and community docs" link is present and leads to the correct url', async () => {
    // Arrange
    const expectedLink = links.OPENSHIFT_LOCAL_SUPPORT_AND_COMMUNITY_DOCS;

    // Act
    render(<LocalTab token={{}} />);

    // Assert
    const docsLink = await screen.findByText(
      'For more information on the OpenShift Local support and community docs click here',
      {
        exact: false,
      },
    );

    expect(docsLink).toBeInTheDocument();
    expect(docsLink).toHaveAttribute('href', expectedLink);
  });

  it('is accessible', async () => {
    // Act
    const { container } = render(<LocalTab token={{}} />);

    // Assert
    await checkAccessibility(container);
  });
});
