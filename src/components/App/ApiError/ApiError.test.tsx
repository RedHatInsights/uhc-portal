import React from 'react';
import type { AxiosResponse } from 'axios';

import apiRequest from '~/services/apiRequest';
import { render, screen } from '~/testUtils';

import ApiError from './ApiError';

const defaultProps = {
  children: <div>ApiErrorChildren</div>,
  apiRequest,
  showApiError: jest.fn(),
  clearApiError: jest.fn(),
};

describe('ApiError', () => {
  test('it works', () => {
    const apiError = null;
    render(
      <ApiError {...defaultProps} apiError={apiError}>
        {defaultProps.children}
      </ApiError>,
    );

    expect(screen.getByText('ApiErrorChildren')).toBeInTheDocument();
  });

  it('should render terms error page', () => {
    const apiError = {
      data: {
        id: '451',
        code: 'CLUSTERS-MGMT-451',
        reason: 'Legal terms should be agreed. See details',
        details: [
          {
            legal_terms_url: 'https://www.redhat.com/wapps/tnc/ackrequired?site=ocm&event=register',
          },
        ],
      },
    } as AxiosResponse;

    render(
      <ApiError {...defaultProps} apiError={apiError}>
        {defaultProps.children}
      </ApiError>,
    );

    expect(screen.getByRole('link', { name: 'View Terms and Conditions' })).toBeInTheDocument();
  });
});
