import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { render, screen } from '~/testUtils';

import InsightsAdvisorRedirector, { composeRuleId } from '../InsightsAdvisorRedirector';

jest.mock('../ExternalRedirect', () => ({
  __esModule: true,
  default: jest.fn(({ url }) => `Redirected to external path "${url}"`),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Preserve other exports from react-router-dom
  Navigate: jest.fn(({ to }) => `Redirected to "${to}"`),
}));

// eslint-disable-next-line react/prop-types
const TestComponent = ({ path = '', route = '', ...rest }) => (
  <MemoryRouter initialEntries={[{ pathname: path }]}>
    <Routes>
      <Route path={route} element={<InsightsAdvisorRedirector {...rest} />} />
      <Route path="/openshift/cluster-list" element={<>Cluster list</>} />
    </Routes>
  </MemoryRouter>
);

const setGlobalError = jest.fn();
const fetchClusterDetails = jest.fn();
const defaultProps = {
  setGlobalError,
  fetchClusterDetails,
  clusterDetails: {
    error: null,
    fulfilled: false,
  },
};
const defaultRouterProps = {
  path: '/openshift/details/5d5892d3-1f74-4ccf-91af-548dfc9767aa',
  route: '/openshift/details/:id',
};

describe('<InsightsAdvisorRedirector />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('redirection to Advisor cluster page: with the external ID', () => {
    it('should redirect', async () => {
      render(<TestComponent {...defaultProps} {...defaultRouterProps} />, { withRouter: false });

      expect(
        screen.getByText(
          'Redirected to external path "/openshift/insights/advisor/clusters/5d5892d3-1f74-4ccf-91af-548dfc9767aa"',
        ),
      ).toBeInTheDocument();
    });

    it('should not call fetchClusterDetails', () => {
      render(<TestComponent {...defaultProps} {...defaultRouterProps} />, { withRouter: false });

      expect(fetchClusterDetails).not.toBeCalled();
    });
  });

  describe('redirection to Advisor recommendation page: with the external ID', () => {
    const routerParams = {
      path: '/openshift/details/5d5892d3-1f74-4ccf-91af-548dfc9767aa/insights/ccx_rules_ocp|external|rules|master_defined_as_machinesets|report/MASTER_DEFINED_AS_MACHINESETS',
      route: '/openshift/details/:id/insights/:reportId/:errorKey',
    };

    it('should redirect', () => {
      render(<TestComponent {...defaultProps} {...routerParams} />, { withRouter: false });

      expect(
        screen.getByText(
          'Redirected to external path "/openshift/insights/advisor/clusters/5d5892d3-1f74-4ccf-91af-548dfc9767aa?first=ccx_rules_ocp.external.rules.master_defined_as_machinesets%7CMASTER_DEFINED_AS_MACHINESETS"',
        ),
      ).toBeInTheDocument();
    });

    it('should not call fetchClusterDetails', () => {
      render(<TestComponent {...defaultProps} {...routerParams} />, { withRouter: false });

      expect(fetchClusterDetails).not.toBeCalled();
    });
  });

  describe('redirection to Advisor cluster page: with the subscription ID', () => {
    const routerParams = {
      path: '/openshift/details/s/1ZyOzuBzgnXcKa92ZE2E4olYmQa',
      route: '/openshift/details/s/:id',
    };

    it('should render spinner and call fetchClusterDetails', () => {
      render(<TestComponent {...defaultProps} {...routerParams} />, { withRouter: false });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    });

    it('should call fetchClusterDetails', () => {
      expect(fetchClusterDetails).not.toBeCalled();

      render(<TestComponent {...defaultProps} {...routerParams} />, { withRouter: false });

      expect(fetchClusterDetails).toBeCalledWith('1ZyOzuBzgnXcKa92ZE2E4olYmQa');
    });

    it('should redirect after successful external ID fetch', () => {
      const { rerender } = render(<TestComponent {...defaultProps} {...routerParams} />, {
        withRouter: false,
      });

      expect(fetchClusterDetails).toBeCalledWith('1ZyOzuBzgnXcKa92ZE2E4olYmQa');

      const fulfilledProps = {
        ...defaultProps,
        clusterDetails: {
          error: null,
          fulfilled: true,
          cluster: {
            external_id: '5d5892d3-1f74-4ccf-91af-548dfc9767aa',
          },
        },
      };

      rerender(<TestComponent {...fulfilledProps} {...routerParams} />, { withRouter: false });

      expect(
        screen.getByText(
          'Redirected to external path "/openshift/insights/advisor/clusters/5d5892d3-1f74-4ccf-91af-548dfc9767aa"',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('redirection to Advisor recommendation page: with the subscription ID', () => {
    const routerParams = {
      path: '/openshift/details/s/1ZyOzuBzgnXcKa92ZE2E4olYmQa/insights/ccx_rules_ocp|external|rules|master_defined_as_machinesets|report/MASTER_DEFINED_AS_MACHINESETS',
      route: '/openshift/details/s/:id/insights/:reportId/:errorKey',
    };

    it('should render spinner', () => {
      render(<TestComponent {...defaultProps} {...routerParams} />, {
        withRouter: false,
      });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    });

    it('should call fetchClusterDetails', () => {
      expect(fetchClusterDetails).not.toBeCalled();

      render(<TestComponent {...defaultProps} {...routerParams} />, {
        withRouter: false,
      });

      expect(fetchClusterDetails).toBeCalledWith('1ZyOzuBzgnXcKa92ZE2E4olYmQa');
    });

    it('should redirect after successful external ID fetch', () => {
      const { rerender } = render(<TestComponent {...defaultProps} {...routerParams} />, {
        withRouter: false,
      });
      expect(fetchClusterDetails).toBeCalledWith('1ZyOzuBzgnXcKa92ZE2E4olYmQa');

      const fulfilledProps = {
        ...defaultProps,
        clusterDetails: {
          error: null,
          fulfilled: true,
          cluster: {
            external_id: '5d5892d3-1f74-4ccf-91af-548dfc9767aa',
          },
        },
      };

      rerender(<TestComponent {...fulfilledProps} {...routerParams} />, {
        withRouter: false,
      });

      expect(
        screen.getByText(
          'Redirected to external path "/openshift/insights/advisor/clusters/5d5892d3-1f74-4ccf-91af-548dfc9767aa?first=ccx_rules_ocp.external.rules.master_defined_as_machinesets%7CMASTER_DEFINED_AS_MACHINESETS"',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('no external ID available', () => {
    const routerParams = {
      path: '/openshift/details/s/1ZyOzuBzgnXcKa92ZE2E4olYmQa',
      route: '/openshift/details/s/:id',
    };

    const noExternalIdProps = {
      ...defaultProps,
      clusterDetails: {
        error: false,
        fulfilled: true,
        cluster: { external_id: '' },
      },
    };

    it('should render a redirect to /openshift/cluster-list', () => {
      render(<TestComponent {...noExternalIdProps} {...routerParams} />, {
        withRouter: false,
      });

      expect(screen.getByText('Redirected to "/openshift/cluster-list"')).toBeInTheDocument();
    });

    it('should call setGlobalError', () => {
      expect(setGlobalError).not.toBeCalled();

      render(<TestComponent {...noExternalIdProps} {...routerParams} />, {
        withRouter: false,
      });

      expect(setGlobalError).toBeCalledWith(expect.anything(), 'clusterDetails', undefined);
    });
  });

  describe('on error', () => {
    const onErrorProps = {
      ...defaultProps,
      clusterDetails: {
        error: true,
        errorMessage: 'error message',
        fulfilled: false,
      },
    };

    const routerParams = {
      path: '/openshift/details/s/1ZyOzuBzgnXcKa92ZE2E4olYmQa',
      route: '/openshift/details/s/:id',
    };

    it('should render a redirect to /openshift/cluster-list', () => {
      render(<TestComponent {...onErrorProps} {...routerParams} />, { withRouter: false });

      expect(screen.getByText('Redirected to "/openshift/cluster-list"')).toBeInTheDocument();
    });

    it('should call setGlobalError', () => {
      expect(setGlobalError).not.toBeCalled();

      render(<TestComponent {...onErrorProps} {...routerParams} />, { withRouter: false });

      expect(setGlobalError).toBeCalledWith(expect.anything(), 'clusterDetails', 'error message');
    });
  });
});

describe('Insights Advisor redirection utilities', () => {
  const testData = [
    [
      'ccx_rules_ocp|external|rules|master_defined_as_machinesets|report',
      'MASTER_DEFINED_AS_MACHINESETS',
      'ccx_rules_ocp.external.rules.master_defined_as_machinesets%7CMASTER_DEFINED_AS_MACHINESETS',
    ],
    [
      'ccx_rules_ocm%7Ctutorial_rule%7Creport',
      'TUTORIAL_ERROR',
      'ccx_rules_ocm.tutorial_rule%7CTUTORIAL_ERROR',
    ],
    [
      'ccx_rules_ocm|tutorial_rule%7Creport',
      'TUTORIAL_ERROR',
      'ccx_rules_ocm.tutorial_rule%7CTUTORIAL_ERROR',
    ],
  ];

  it.each(testData)('%s plugin', (pluginName, errorKey, expected) => {
    expect(composeRuleId(pluginName, errorKey)).toBe(expected);
  });
});
