import React from 'react';
import * as reactRedux from 'react-redux';

import * as locationUtils from '~/common/location';
import { defaultSubscription } from '~/components/clusters/common/__tests__/defaultClusterFromSubscription.fixtures';
import { selfTermsReview } from '~/redux/actions/userActions';
import { useGlobalState } from '~/redux/hooks';
import { checkAccessibility, render, screen } from '~/testUtils';

import { buildUrlParams } from '../../../../../common/queryHelpers';
import { normalizedProducts } from '../../../../../common/subscriptionTypes';
import TermsAlert from '../ClusterDetailsTop/components/TermsAlert';

import * as Fixtures from './fixtures/TermsAlert.fixtures';

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('~/redux/actions/userActions', () => ({
  selfTermsReview: jest.fn(),
}));

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const useGlobalStateMock = useGlobalState as jest.Mock;
const selfTermsReviewMock = selfTermsReview as jest.Mock;

describe('<TermsAlert />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty Alert', () => {
    it('TermsAlert OCP', () => {
      // Act
      const { container } = render(
        <TermsAlert
          subscription={{ ...defaultSubscription, plan: { id: normalizedProducts.OCP } }}
        />,
      );

      // Assert
      expect(container).toBeEmptyDOMElement();
    });

    it('TermsAlert has no required terms', () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({ terms_required: false });

      // Act
      const { container } = render(<TermsAlert subscription={Fixtures.subscription} />);

      // Assert
      expect(container).toBeEmptyDOMElement();
    });

    it('required terms but not fulfilled', () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({ terms_required: true, fulfilled: false });

      // Act
      const { container } = render(<TermsAlert subscription={Fixtures.subscription} />);

      // Assert
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('TermsAlert has required terms', () => {
    const currentUrl = 'http://cloud.openshift.com/details/123';

    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    const mockedDispatch = jest.fn();
    useDispatchMock.mockReturnValue(mockedDispatch);

    selfTermsReviewMock.mockReturnValue('selfTermsReviewResult');

    let locationSpy: jest.SpyInstance;

    beforeEach(() => {
      locationSpy = jest.spyOn(locationUtils, 'getLocation');

      locationSpy.mockReturnValue({
        href: currentUrl,
        pathname: '/',
      });
    });

    afterEach(() => {
      locationSpy.mockRestore();
    });

    it('is accessible', async () => {
      // Arrange
      useGlobalStateMock.mockReturnValue(Fixtures.selfTermsReviewResult);

      // Act
      const { container } = render(<TermsAlert subscription={Fixtures.subscription} />);

      // Assert
      await checkAccessibility(container);
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(mockedDispatch).toHaveBeenCalledWith('selfTermsReviewResult');

      expect(screen.getByTestId('terms-alert')).toBeInTheDocument();
    });

    it('should contain link to terms app', () => {
      // Arrange
      useGlobalStateMock.mockReturnValue(Fixtures.selfTermsReviewResult);

      // Act
      render(<TermsAlert subscription={Fixtures.subscription} />);

      // Assert
      expect(screen.getByRole('link', { name: 'View Terms and Conditions' })).toHaveAttribute(
        'href',
        `${Fixtures.tncUrl}&${buildUrlParams({
          redirect: currentUrl,
          cancelRedirect: currentUrl,
        })}`,
      );
    });

    describe('updating', () => {
      it('is updated', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue(Fixtures.selfTermsReviewResult);
        const { rerender } = render(<TermsAlert subscription={Fixtures.subscription} />);
        expect(selfTermsReviewMock).toHaveBeenCalledTimes(1);

        // Act
        rerender(<TermsAlert subscription={{ ...Fixtures.subscription, id: '123' }} />);

        // Assert
        expect(selfTermsReviewMock).toHaveBeenCalledTimes(2);
      });

      it('is not updated', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue(Fixtures.selfTermsReviewResult);
        const { rerender } = render(<TermsAlert subscription={Fixtures.subscription} />);
        expect(selfTermsReviewMock).toHaveBeenCalledTimes(1);

        // Act
        rerender(
          <TermsAlert subscription={{ ...Fixtures.subscription, id: Fixtures.subscription.id }} />,
        );

        // Assert
        expect(selfTermsReviewMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
