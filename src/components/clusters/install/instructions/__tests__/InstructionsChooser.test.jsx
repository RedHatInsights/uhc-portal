import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { InstructionsChooser } from '../InstructionsChooser';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const checkForCard = async (url, cardTitle, user) => {
  const instructionCard = screen.getByRole('button', { name: cardTitle });
  expect(instructionCard).toBeInTheDocument();
  await user.click(instructionCard);
  return expect(mockNavigate).toHaveBeenLastCalledWith(`/openshift${url}`, undefined);
};

describe('<InstructionsChooser />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default settings', async () => {
    const ipiPageLink = '/install/aws/installer-provisioned';
    const upiPageLink = '/install/aws/user-provisioned';
    const { container, user } = render(
      <InstructionsChooser ipiPageLink={ipiPageLink} upiPageLink={upiPageLink} />,
    );

    await checkAccessibility(container);

    await checkForCard(ipiPageLink, 'Automated', user);
    await checkForCard(upiPageLink, 'Full control', user);

    const aiLink = screen.queryByRole('link', { name: 'Interactive Recommended Web-based' });
    expect(aiLink).not.toBeInTheDocument();
  });

  it('renders correctly with AI enabled', async () => {
    const aiPageLink = '/assisted-installer/clusters/~new';
    const ipiPageLink = '/install/metal/installer-provisioned';
    const upiPageLink = '/install/metal/user-provisioned';

    const { container, user } = render(
      <InstructionsChooser
        aiPageLink={aiPageLink}
        ipiPageLink={ipiPageLink}
        upiPageLink={upiPageLink}
      />,
    );
    await checkAccessibility(container);

    await checkForCard(ipiPageLink, 'Automated', user);
    await checkForCard(upiPageLink, 'Full control', user);
    await checkForCard(aiPageLink, 'Interactive', user);
  });

  it('renders correctly with AI and UPI', async () => {
    const aiPageLink = '/assisted-installer/clusters/~new';
    const ipiPageLink = '/install/metal/installer-provisioned';
    const upiPageLink = '/install/metal/user-provisioned';

    const { container, user } = render(
      <InstructionsChooser
        aiPageLink={aiPageLink}
        ipiPageLink={ipiPageLink}
        upiPageLink={upiPageLink}
        hideIPI
      />,
    );

    await checkAccessibility(container);

    await checkForCard(upiPageLink, 'Full control', user);
    await checkForCard(aiPageLink, 'Interactive', user);

    const ipiLink = screen.queryByRole('link', { name: 'Automated' });
    expect(ipiLink).not.toBeInTheDocument();
  });
});
