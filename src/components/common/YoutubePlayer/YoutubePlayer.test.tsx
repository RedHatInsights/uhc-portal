import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { YoutubePlayer } from './YoutubePlayer';

describe('YoutubePlayer component test case', () => {
  it('is accessible', async () => {
    const { container } = render(<YoutubePlayer videoID="testVideoID" />);
    expect(
      await screen.findByTestId('drawer-panel-content__explanation-video'),
    ).toBeInTheDocument();

    await checkAccessibility(container);
  });
});
