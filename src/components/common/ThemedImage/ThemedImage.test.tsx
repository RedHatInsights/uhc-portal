import React from 'react';

import { useRemoteHook } from '@scalprum/react-core';

import { checkAccessibility, render, screen } from '~/testUtils';

import { ThemedImage } from './ThemedImage';

jest.mock('@scalprum/react-core', () => ({
  useRemoteHook: jest.fn(),
}));

const useRemoteHookMock = useRemoteHook as jest.MockedFunction<typeof useRemoteHook>;

const baseProps = {
  darkThemeSrc: 'dark-theme-image.svg',
  lightThemeSrc: 'light-theme-image.png',
  alt: 'a themed logo',
};

const baseRemoteHookReturnValue = {
  id: '123',
  hookResult: { isDark: false },
  loading: false,
  error: null,
};

describe('ThemedImage', () => {
  beforeEach(() => {
    useRemoteHookMock.mockReturnValue(baseRemoteHookReturnValue);
  });

  afterEach(() => {
    useRemoteHookMock.mockReset();
  });

  it('is accessible', async () => {
    const { container } = render(<ThemedImage {...baseProps} />);
    await checkAccessibility(container);
  });

  it('renders alt text', () => {
    render(<ThemedImage {...baseProps} />);
    const altTextEl = screen.getByAltText('a themed logo');
    expect(altTextEl).toBeInTheDocument();
  });

  it('renders a custom classname', () => {
    render(<ThemedImage {...baseProps} className="wat-wut" />);
    const imgEl = screen.getByRole('img');
    expect(imgEl).toHaveClass('wat-wut');
  });

  it('renders the correct image on light-theme', () => {
    render(<ThemedImage {...baseProps} />);
    const imgEl = screen.getByRole('img');
    expect(imgEl).toHaveAttribute('src', 'light-theme-image.png');
  });

  it('renders the correct image on dark-theme', () => {
    useRemoteHookMock.mockReturnValue({
      ...baseRemoteHookReturnValue,
      hookResult: { isDark: true },
    });
    render(<ThemedImage {...baseProps} />);
    const imgEl = screen.getByRole('img');
    expect(imgEl).toHaveAttribute('src', 'dark-theme-image.svg');
  });

  it('renders the light-theme image by default', () => {
    useRemoteHookMock.mockReturnValue({
      ...baseRemoteHookReturnValue,
      hookResult: {},
    });
    render(<ThemedImage {...baseProps} />);
    const imgEl = screen.getByRole('img');
    expect(imgEl).toHaveAttribute('src', 'light-theme-image.png');
  });

  it('renders the light-theme image when the theme query is loading', () => {
    useRemoteHookMock.mockReturnValue({
      ...baseRemoteHookReturnValue,
      loading: true,
    });
    render(<ThemedImage {...baseProps} />);
    const imgEl = screen.getByRole('img');
    expect(imgEl).toHaveAttribute('src', 'light-theme-image.png');
  });

  it('renders the light-theme image if the theme query has an error', () => {
    useRemoteHookMock.mockReturnValue({
      ...baseRemoteHookReturnValue,
      error: new Error('nope!!'),
    });
    render(<ThemedImage {...baseProps} />);
    const imgEl = screen.getByRole('img');
    expect(imgEl).toHaveAttribute('src', 'light-theme-image.png');
  });
});
