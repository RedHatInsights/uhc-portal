import React from 'react';
import * as reactRedux from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { CLUSTER_LIST_PATH, ocmBaseName } from '~/common/routing';
import * as useFetchSubscriptionIdForCluster from '~/queries/ClusterDetailsQueries/useFetchSubscriptionIdForCluster';
import { render, screen } from '~/testUtils';

import ClusterDetailsRedirector from './ClusterDetailsRedirector';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Preserve other exports from react-router-dom
  useParams: jest.fn(),
  useLocation: jest.fn(),
  Navigate: jest.fn(({ to }) => `Redirected to "${to}"`),
}));

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const mockedUseFetchSubscriptionIdForCluster = jest.spyOn(
  useFetchSubscriptionIdForCluster,
  'useFetchSubscriptionIdForCluster',
);

describe('<ClusterDetailsRedirector />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.unmock('react-router-dom');
  });

  useParams.mockReturnValue({ id: 'foo' });
  useLocation.mockReturnValue({ hash: '#bar' });

  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  describe('when pending or not yet fulfilled', () => {
    it('should render a spinner', () => {
      mockedUseFetchSubscriptionIdForCluster.mockReturnValue({ isLoading: true, isFetched: false });
      render(<ClusterDetailsRedirector />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('on error', () => {
    describe('404 error', () => {
      it(`should render a redirect to ${ocmBaseName}${CLUSTER_LIST_PATH}`, () => {
        mockedUseFetchSubscriptionIdForCluster.mockReturnValue({
          isLoading: false,
          isError: false,
          subscriptionID: undefined,
          isFetched: true,
        });
        render(<ClusterDetailsRedirector />);
        expect(
          screen.getByText(`Redirected to "${ocmBaseName}${CLUSTER_LIST_PATH}"`),
        ).toBeInTheDocument();

        expect(mockedDispatch).toHaveBeenCalled();
        const mockedCall = mockedDispatch.mock.calls[0][0];
        expect(mockedCall.type).toEqual('SET_GLOBAL_ERROR');

        expect(mockedCall.payload).toEqual({
          errorTitle:
            "Cluster with ID foo was not found, it might have been deleted or you don't have permission to see it.",
          errorMessage: '',
          sourceComponent: 'clusterDetails',
        });
      });
    });
    describe('500 error', () => {
      it('should render an Unavailable message', () => {
        mockedUseFetchSubscriptionIdForCluster.mockReturnValue({
          isLoading: false,
          isError: true,
          subscriptionID: undefined,
          isFetched: true,
          error: {},
        });
        render(<ClusterDetailsRedirector />);
        expect(screen.getByText('This page is temporarily unavailable')).toBeInTheDocument();
      });
    });
  });
  describe('on fulfilled', () => {
    it('should render a redirect', async () => {
      useParams.mockReturnValue({ id: 'foo' });
      useLocation.mockReturnValue({ hash: '#bar' });
      mockedUseFetchSubscriptionIdForCluster.mockReturnValue({
        isLoading: false,
        isError: false,
        isFetched: true,
        subscriptionID: 'fooSubscriptionId',
      });

      render(<ClusterDetailsRedirector />);

      expect(
        screen.getByText('Redirected to "/openshift/details/s/fooSubscriptionId#bar"'),
      ).toBeInTheDocument();
    });
  });
});
