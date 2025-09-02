import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import Quota from '../Quota';

import * as Fixtures from './Quota.fixtures';

const props = {
  marketplace: undefined,
};

describe('<Quota />', () => {
  describe('Quota', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it.skip('is accessible', async () => {
      const newProps = { ...props, marketplace: true };
      const { container } = render(<Quota {...Fixtures} {...newProps} />);
      expect(await screen.findByText('OpenShift Dedicated')).toBeInTheDocument();

      // Throws a "Heading levels should only increase by one (heading-order)" error
      await checkAccessibility(container);
    });

    it('should call fetch method', async () => {
      const newProps = { ...props, marketplace: true };
      expect(Fixtures.fetchAccount).not.toHaveBeenCalled();
      render(<Quota {...Fixtures} {...newProps} />);
      expect(await screen.findByText('OpenShift Dedicated')).toBeInTheDocument();

      expect(Fixtures.fetchAccount).toHaveBeenCalled();
    });

    it('should have Header, OCP and OSD cards and display correct text when is marketplace', async () => {
      const newProps = { ...props, marketplace: true };
      render(<Quota {...Fixtures} {...newProps} />);

      expect(await screen.findByText('OpenShift Dedicated')).toBeInTheDocument();

      expect(
        screen.getByRole('heading', { level: 1, name: 'Dedicated (On-Demand Limits)' }),
      ).toBeInTheDocument();
    });

    it('displays the correct text when is not marketplace', async () => {
      render(<Quota {...Fixtures} {...props} />);

      expect(await screen.findByText('Annual Subscriptions')).toBeInTheDocument();

      expect(
        screen.getByRole('heading', { level: 1, name: 'Annual Subscriptions (Managed)' }),
      ).toBeInTheDocument();
    });
  });
});
