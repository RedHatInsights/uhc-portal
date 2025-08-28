/*
Copyright (c) 2019 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';

import {
  checkAccessibility,
  mockRefreshToken,
  mockRestrictedEnv,
  mockUseChrome,
  render,
  screen,
} from '~/testUtils';

import Tokens from '../Instructions';

describe('<Tokens />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  mockRefreshToken();
  const getOfflineTokenMock = jest.fn(() =>
    Promise.resolve({
      data: {
        scope: 'scope',
        refresh_token: 'refresh_token',
      },
    }),
  );
  mockUseChrome({
    auth: {
      getOfflineToken: getOfflineTokenMock,
    },
  });

  const setShouldShowTokens = jest.fn();

  it('is accessible with button', async () => {
    const { container } = render(
      <Tokens
        show={false}
        isRosa={false}
        SSOLogin={false}
        showPath="/token/show"
        shouldShowTokens
        setShouldShowTokens={setShouldShowTokens}
      />,
    );

    expect(await screen.findByRole('button', { name: 'Load token' })).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('is accessible with token', async () => {
    const { container } = render(
      <Tokens
        show
        showPath="/token/show"
        isRosa={false}
        SSOLogin={false}
        shouldShowTokens
        setShouldShowTokens={setShouldShowTokens}
      />,
    );

    expect(await screen.findByRole('link', { name: 'Download ocm CLI' })).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('Renders loading screen', async () => {
    const { container } = render(
      <Tokens
        show
        isRosa={false}
        SSOLogin={false}
        shouldShowTokens
        setShouldShowTokens={setShouldShowTokens}
      />,
    );

    expect(
      await screen.findByText('Copy and paste the authentication command in your terminal:'),
    ).toBeInTheDocument();
    expect(container.querySelector('.pf-v6-c-skeleton')).toBeInTheDocument();
  });

  it('Calls getOfflineToken', async () => {
    expect(getOfflineTokenMock).not.toHaveBeenCalled();

    render(
      <Tokens
        show
        isRosa={false}
        SSOLogin={false}
        shouldShowTokens
        setShouldShowTokens={setShouldShowTokens}
      />,
    );
    expect(getOfflineTokenMock).toHaveBeenCalled();
    expect(await screen.findByRole('link', { name: 'Download ocm CLI' })).toBeInTheDocument();
  });

  describe('in restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();
    afterAll(() => {
      isRestrictedEnv.mockReturnValue(false);
    });

    const setShouldShowTokens = jest.fn();

    it('Renders screen with refresh token', async () => {
      isRestrictedEnv.mockReturnValue(true);
      render(
        <Tokens
          show
          isRosa={false}
          SSOLogin={false}
          showPath="myshowpath"
          shouldShowTokens
          setShouldShowTokens={setShouldShowTokens}
        />,
      );

      expect(await screen.findByText('Your API token')).toBeInTheDocument();
    });
  });
});
