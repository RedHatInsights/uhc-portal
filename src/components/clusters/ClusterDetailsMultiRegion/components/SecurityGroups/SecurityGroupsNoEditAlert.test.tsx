import React from 'react';

import links from '~/common/installLinks.mjs';
import { checkAccessibility, render, screen } from '~/testUtils';

import SecurityGroupsNoEditAlert from './SecurityGroupsNoEditAlert';

const renderComponent = (props: { isHypershift: boolean }) => {
  const { container, user } = render(<SecurityGroupsNoEditAlert {...props} />);
  return { container, user };
};

describe('<SecurityGroupsNoEditAlert />', () => {
  describe('Component rendering', () => {
    it('renders the alert component', () => {
      const { container } = renderComponent({ isHypershift: false });

      expect(container.querySelector('.pf-v6-c-alert')).toBeInTheDocument();
    });

    it('renders as an info alert', () => {
      const { container } = renderComponent({ isHypershift: false });

      const alert = container.querySelector('.pf-v6-c-alert');
      expect(alert).toHaveClass('pf-m-info');
    });

    it('renders as an inline alert', () => {
      const { container } = renderComponent({ isHypershift: false });

      const alert = container.querySelector('.pf-v6-c-alert');
      expect(alert).toHaveClass('pf-m-inline');
    });
  });

  describe('Alert title content', () => {
    it('displays the correct title for non-hypershift clusters', () => {
      renderComponent({ isHypershift: false });

      expect(
        screen.getByText(
          'You cannot add or edit security groups associated with the control plane nodes, infrastructure nodes, or machine pools that were created by default during cluster creation.',
        ),
      ).toBeInTheDocument();
    });

    it('displays the correct title for hypershift clusters', () => {
      renderComponent({ isHypershift: true });

      expect(
        screen.getByText(
          'You cannot add or edit security groups associated with machine pools that were created during cluster creation.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Alert action link', () => {
    it('renders the correct security groups link for non-hypershift clusters', () => {
      renderComponent({ isHypershift: false });

      const link = screen.getByRole('link', { name: /View more information/i });

      expect(link).toHaveAttribute('href', links.ROSA_CLASSIC_SECURITY_GROUPS);
    });

    it('renders the correct security groups link for hypershift clusters', () => {
      renderComponent({ isHypershift: true });

      const link = screen.getByRole('link', { name: /View more information/i });

      expect(link).toHaveAttribute('href', links.ROSA_SECURITY_GROUPS);
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations for non-hypershift clusters', async () => {
      const { container } = renderComponent({ isHypershift: false });

      await checkAccessibility(container);
    });

    it('has no accessibility violations for hypershift clusters', async () => {
      const { container } = renderComponent({ isHypershift: true });

      await checkAccessibility(container);
    });
  });
});
