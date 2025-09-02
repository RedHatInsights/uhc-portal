import { renderHook, waitFor } from '@testing-library/react';

import authorizationsService from '~/services/authorizationsService';

import { useTCSigned } from './use-tc-signed';

jest.mock('~/services/authorizationsService', () => ({
  selfTermsReview: jest.fn(),
}));

describe('useTCSigned', () => {
  const mockedSelfTermsReview = authorizationsService.selfTermsReview as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('returns data from api call', async () => {
    mockedSelfTermsReview.mockResolvedValue({
      data: {
        terms_required: false,
        redirect_url: 'my_redirect_url',
      },
    });
    const { result } = renderHook(() => useTCSigned());

    let [tcSigned, redirectURL, isLoading, error] = result.current;
    expect(isLoading).toBe(true);

    await waitFor(() => {
      const [_tcSigned, _redirectURL, isLoading] = result.current;
      expect(isLoading).toBe(false);
    });

    [tcSigned, redirectURL, isLoading, error] = result.current;

    expect(tcSigned).toEqual(true);
    expect(redirectURL).toEqual('my_redirect_url');
    expect(error).toBeUndefined();

    expect(mockedSelfTermsReview).toHaveBeenLastCalledWith({
      check_optional_terms: true,
      event_code: 'govCloud',
      site_code: 'cloudServices',
    });
  });

  it('returns error from data call', async () => {
    mockedSelfTermsReview.mockRejectedValue('this is an error');
    const { result } = renderHook(() => useTCSigned());

    // let [tcSigned, redirectURL, isLoading, error] = result.current;
    expect(result.current[2]).toBe(true);

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    expect(result.current[3]).toEqual('Failed to detect Enterprise agreement & Appendix 4 status.');
  });
});
