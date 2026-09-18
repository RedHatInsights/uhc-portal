import React from 'react';

import { ROSA_HOSTED_CLI_MIN_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';
import { checkAccessibility, render, screen } from '~/testUtils';

import { AWSAccountRole } from './common/AssociateAWSAccountStep';
import { buildAssociateAWSAccountDrawerContent } from './AssociateAWSAccountDrawerContent';

const ROSA_CLI_REQUIREMENT = `You must use ROSA CLI version ${ROSA_HOSTED_CLI_MIN_VERSION} or above.`;

const renderDrawerContent = ({
  targetRole,
  isHypershiftSelected = false,
  onClose = jest.fn(),
}: {
  targetRole?: AWSAccountRole;
  isHypershiftSelected?: boolean;
  onClose?: () => void;
} = {}) => {
  const { head, body } = buildAssociateAWSAccountDrawerContent({
    targetRole,
    isHypershiftSelected,
    onClose,
  });

  return render(
    <>
      {head}
      {body}
    </>,
  );
};

describe('AssociateAWSAccountDrawerContent', () => {
  it('is accessible on initial render', async () => {
    const { container } = renderDrawerContent();

    await checkAccessibility(container);
  });

  it('displays the full associate-account guide when targetRole is omitted', () => {
    renderDrawerContent();

    expect(
      screen.getByRole('heading', { name: 'How to associate a new AWS account' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Step 1: OCM role')).toBeInTheDocument();
    expect(screen.getByText('Step 2: User role')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Account roles')).toBeInTheDocument();
    expect(screen.getByText(/you can continue to step 2/i)).toBeInTheDocument();
    expect(screen.getByText(/close this guide and choose your account/i)).toBeInTheDocument();
  });

  it.each([
    {
      targetRole: 'ocm' as const,
      title: 'Create OCM role',
      footer: 'Refresh',
    },
    {
      targetRole: 'user' as const,
      title: 'Create user role',
      footer: /close this guide and try again/i,
    },
    {
      targetRole: 'account' as const,
      title: 'Create account roles',
      footer: 'Refresh ARNs',
    },
  ])(
    'displays only $title content when targetRole is "$targetRole"',
    ({ targetRole, title, footer }) => {
      renderDrawerContent({ targetRole });

      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      expect(screen.queryByText('Step 1: OCM role')).not.toBeInTheDocument();
      expect(screen.queryByText('Step 2: User role')).not.toBeInTheDocument();
      expect(screen.queryByText('Step 3: Account roles')).not.toBeInTheDocument();
      expect(screen.getByText(footer)).toBeInTheDocument();
    },
  );

  it('shows the ROSA CLI version requirement when Hypershift is selected', () => {
    renderDrawerContent({ isHypershiftSelected: true });

    expect(screen.getByText(ROSA_CLI_REQUIREMENT)).toBeInTheDocument();
  });

  it('does not show the ROSA CLI version requirement when Hypershift is not selected', () => {
    renderDrawerContent({ isHypershiftSelected: false });

    expect(screen.queryByText(ROSA_CLI_REQUIREMENT)).not.toBeInTheDocument();
  });

  it('calls onClose when the Close button is clicked', async () => {
    const onClose = jest.fn();
    const { user } = renderDrawerContent({ onClose });

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
