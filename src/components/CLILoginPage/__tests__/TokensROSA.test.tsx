/*
Copyright (c) 2020 Red Hat, Inc.

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

import { checkAccessibility, mockUseChrome, render, screen } from '~/testUtils';

import TokensROSA from '../InstructionsROSA';

describe('<TokensROSA />', () => {
  const getOfflineTokenMock = jest.fn(() =>
    Promise.resolve({
      data: {
        scope: 'scope',
        refresh_token: 'hello',
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
      <TokensROSA
        isRosa
        SSOLogin={false}
        show={false}
        showPath="/token/show"
        shouldShowTokens
        setShouldShowTokens={setShouldShowTokens}
      />,
    );

    expect(screen.getByRole('button', { name: 'Load token' })).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('Renders token', async () => {
    render(
      <TokensROSA
        isRosa
        SSOLogin={false}
        show
        shouldShowTokens
        setShouldShowTokens={setShouldShowTokens}
      />,
    );
    expect(await screen.findByRole('link', { name: 'Download the ROSA CLI' })).toBeInTheDocument();
  });
});
