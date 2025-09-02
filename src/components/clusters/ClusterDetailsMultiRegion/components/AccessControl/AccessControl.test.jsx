import React from 'react';

import { normalizedProducts } from '~/common/subscriptionTypes';
import clusterStates from '~/components/clusters/common/clusterStates';
import { screen, withState } from '~/testUtils';

import AccessControl from './AccessControl';

const buildCluster = ({ clusterProps, subscriptionProps, consoleUrl, apiUrl }) => ({
  canEdit: true,
  id: 'clusterId',
  cloud_provider: { id: 'azure' },
  subscription: {
    id: 'subscriptionId',
    ...subscriptionProps,
  },
  managed: true,
  state: 'ready',
  console: {
    url:
      consoleUrl === undefined ? 'https://console-openshift-console.apps.example.com' : consoleUrl,
  },
  api: { url: apiUrl === undefined ? 'https://api.test-liza.wiex.s1.devshift.org:6443' : apiUrl },
  ...clusterProps,
});

// state.clusters.details.cluster.subscription?.id,
const initialState = {
  clusters: { details: { cluster: { subscription: { id: 'mySubId' } } } },
};

describe('<AccessControl />', () => {
  const buildComponent = (cluster) => (
    <AccessControl cluster={cluster || buildCluster({})} isAutoClusterTransferOwnershipEnabled />
  );

  describe('Tab grouping', () => {
    it('has "single-tab" class if only one section is shown', () => {
      const singleTabCluster = buildCluster({
        clusterProps: {
          managed: false,
          idpActions: {
            get: false,
            list: false,
            create: false,
            update: false,
            delete: false,
          },
        },
      });
      withState(initialState, true).render(buildComponent(singleTabCluster));

      const cardBody = document.querySelector('.pf-v6-c-card__body');
      expect(cardBody.classList).toContain('single-tab');
      expect(screen.getAllByRole('tab')).toHaveLength(1);
    });

    it('does not have "single-tab" class if multiple tabs are shown', () => {
      const multipleTabCluster = buildCluster({
        clusterProps: {
          managed: true,
          idpActions: {
            get: false,
            list: false,
            create: false,
            update: false,
            delete: false,
          },
        },
      });
      withState(initialState, true).render(buildComponent(multipleTabCluster));

      const cardBody = document.querySelector('.pf-v6-c-card__body');
      expect(cardBody.classList).not.toContain('single-tab');
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });
  });

  describe('Identity Provider section', () => {
    it('is not shown for OSD/ROSA clusters before they have console URL', () => {
      const osdCluster = buildCluster({
        consoleUrl: '',
        clusterProps: {
          idpActions: {
            get: false,
            list: false,
            create: false,
            update: false,
            delete: false,
          },
        },
      });
      withState(initialState, true).render(buildComponent(osdCluster));

      expect(screen.queryByRole('tab', { name: 'Identity providers' })).not.toBeInTheDocument();
    });

    it('is shown for OSD/ROSA clusters after they have console URL', () => {
      // render(buildComponent());
      const osdCluster = buildCluster({
        consoleUrl: 'https://myConsole.url',
        clusterProps: {
          idpActions: {
            get: false,
            list: false,
            create: false,
            update: false,
            delete: false,
          },
        },
      });
      withState(initialState, true).render(buildComponent(osdCluster));

      expect(
        screen.getByRole('tab', { name: 'Identity providers', selected: true }),
      ).toBeInTheDocument();
    });

    it('is shown for Hypershift clusters even before they have console URL', () => {
      const hypershiftCluster = buildCluster({
        clusterProps: {
          hypershift: { enabled: true },
          idpActions: {
            get: false,
            list: false,
            create: false,
            update: false,
            delete: false,
          },
        },
        subscriptionProps: {
          plan: { id: normalizedProducts.ROSA_HyperShift },
        },
        consoleUrl: '',
      });

      withState(initialState, true).render(buildComponent(hypershiftCluster));
      expect(
        screen.getByRole('tab', { name: 'Identity providers', selected: true }),
      ).toBeInTheDocument();
    });
  });

  describe('Cluster roles and access', () => {
    it('is hidden for clusters before they are ready', () => {
      const hypershiftCluster = buildCluster({
        clusterProps: {
          hypershift: { enabled: true },
          state: clusterStates.installing,
          idpActions: {
            get: false,
            list: false,
            create: false,
            update: false,
            delete: false,
          },
        },
        subscriptionProps: {
          plan: { id: normalizedProducts.ROSA_HyperShift },
        },
        consoleUrl: '',
      });
      withState(initialState, true).render(buildComponent(hypershiftCluster));

      expect(
        screen.queryByRole('tab', { name: 'Cluster Roles and Access' }),
      ).not.toBeInTheDocument();
    });

    it('is shown for ready clusters regardless if they have a console URL', () => {
      const hypershiftCluster = buildCluster({
        clusterProps: {
          hypershift: { enabled: true },
          idpActions: {
            get: false,
            list: false,
            create: false,
            update: false,
            delete: false,
          },
        },
        subscriptionProps: {
          plan: { id: normalizedProducts.ROSA_HyperShift },
        },
        consoleUrl: '',
      });
      withState(initialState, true).render(buildComponent(hypershiftCluster));

      expect(screen.getByRole('tab', { name: 'Cluster Roles and Access' })).toBeInTheDocument();
    });
  });

  describe('Transfer Ownership section', () => {
    it('is hidden for invalid clusters', () => {
      const testCluster = buildCluster({
        clusterProps: {
          hypershift: { enabled: true },
          state: clusterStates.INSTALLING,
          idpActions: {
            get: false,
            list: false,
            create: false,
            update: false,
            delete: false,
          },
        },
        subscriptionProps: {
          plan: { id: normalizedProducts.ROSA_HyperShift },
        },
        consoleUrl: '',
      });
      withState(initialState, true).render(buildComponent(testCluster));

      expect(screen.queryByRole('tab', { name: 'Transfer Ownership' })).not.toBeInTheDocument();
    });

    it('is shown for ROSA cluster', () => {
      const testCluster = buildCluster({
        clusterProps: {
          hypershift: { enabled: false },
          product: { id: 'ROSA' },
          idpActions: {
            get: false,
            list: false,
            create: false,
            update: false,
            delete: false,
          },
        },
        subscriptionProps: {
          plan: { id: normalizedProducts.ROSA },
        },
        consoleUrl: '',
      });
      withState(initialState, true).render(buildComponent(testCluster));

      expect(screen.getByRole('tab', { name: 'Transfer Ownership' })).toBeInTheDocument();
    });
  });
});
