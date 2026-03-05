import React from 'react';

import { render, screen, waitFor } from '~/testUtils';

import ClusterActionsDropdown from './ClusterActionsDropdown';
import * as Fixtures from './ClusterActionsDropdown.fixtures';

const menuOptions = [
  'Open console',
  'Edit display name',
  //   'Edit load balancers and persistent storage',
  //   'Edit machine pool',
  //   'Hibernate cluster',
  //   'Delete cluster',
];

describe('<ClusterActionsDropdown />', () => {
  describe('cluster with state ready and console url', () => {
    it('has expected options', async () => {
      const { user } = render(<ClusterActionsDropdown {...Fixtures.managedReadyProps} />);
      await user.click(screen.getByRole('button'));
      expect(await screen.findByRole('menu')).toBeInTheDocument();
      menuOptions.forEach((option) => {
        expect(screen.getByRole('menuitem', { name: option })).toBeEnabled();
      });
    });

    it('disabled Delete cluster option', async () => {
      const props = {
        ...Fixtures.managedReadyProps,
        cluster: {
          ...Fixtures.managedReadyProps.cluster,
          delete_protection: { enabled: true },
        },
      };
      const { user } = render(<ClusterActionsDropdown {...props} />);
      await user.click(screen.getByRole('button'));
      expect(await screen.findByRole('menu')).toBeInTheDocument();
      menuOptions.forEach((option) => {
        if (option === 'Delete cluster') {
          expect(screen.getByRole('menuitem', { name: option })).toHaveAttribute(
            'aria-disabled',
            'true',
          );
        }
      });
    });
  });

  describe('cluster with state uninstalling', () => {
    it('has disabled options (uninstalling)', async () => {
      const { user } = render(<ClusterActionsDropdown {...Fixtures.clusterUninstallingProps} />);
      await user.click(screen.getByRole('button'));
      expect(await screen.findByRole('menu')).toBeInTheDocument();
      menuOptions.forEach((option) => {
        // There is an issue with PF menu items in that they aren't fully disabled
        //  expect(screen.getByRole('menuitem', { name: option })).not.toBeEnabled();

        expect(screen.getByRole('menuitem', { name: option })).toHaveAttribute(
          'aria-disabled',
          'true',
        );
      });
    });
  });

  describe('cluster with state not ready', () => {
    it('has expected option items (not ready)', async () => {
      const { user } = render(<ClusterActionsDropdown {...Fixtures.clusterNotReadyProps} />);
      await user.click(screen.getByRole('button'));
      expect(await screen.findByRole('menu')).toBeInTheDocument();

      menuOptions.forEach((option) => {
        if (option === 'Edit display name' || option === 'Delete cluster') {
          expect(screen.getByRole('menuitem', { name: option })).toBeEnabled();
        } else {
          expect(screen.getByRole('menuitem', { name: option })).toHaveAttribute(
            'aria-disabled',
            'true',
          );
        }
      });
    });
  });

  describe('self managed cluster', () => {
    it('show expected options (self managed)', async () => {
      const { user } = render(<ClusterActionsDropdown {...Fixtures.selfManagedProps} />);
      await user.click(screen.getByRole('button'));
      expect(await screen.findByRole('menu')).toBeInTheDocument();

      expect(screen.getByRole('menuitem', { name: 'Open console' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );

      expect(screen.getByRole('menuitem', { name: 'Edit display name' })).toBeEnabled();
      //   expect(screen.getByRole('menuitem', { name: 'Add console URL' })).toBeEnabled();
    });
  });

  describe('read only cluster', () => {
    it('shows expected options', async () => {
      const { user } = render(<ClusterActionsDropdown {...Fixtures.organizationClusterProps} />);
      await user.click(screen.getByRole('button'));
      expect(await screen.findByRole('menu')).toBeInTheDocument();

      expect(screen.getByRole('menuitem', { name: 'Open console' })).toBeEnabled();
    });
  });

  describe('rhoic cluster', () => {
    it.skip('shows expected options (rhoic)', async () => {
      const { user } = render(
        <ClusterActionsDropdown {...Fixtures.rhoicCluster} canTransferClusterOwnership />,
      );
      await user.click(screen.getByRole('button'));
      expect(await screen.findByRole('menu')).toBeInTheDocument();

      expect(screen.getByRole('menuitem', { name: 'Transfer cluster ownership' })).toBeEnabled();
    });
  });

  it('closes automatically when clicking outside of it', async () => {
    const { user } = render(
      <>
        <ClusterActionsDropdown {...Fixtures.managedReadyProps} />
        <span>another element</span>
      </>,
    );

    // click on dropdown
    await user.click(screen.getByRole('button'));

    // expect dropdown menu is open
    expect(await screen.findByRole('menu')).toBeInTheDocument();

    // click on another element
    await user.click(screen.getByText('another element'));

    // expect dropdown menu is not present
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});
