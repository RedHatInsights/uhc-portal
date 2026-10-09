import React from 'react';
import * as ReactRedux from 'react-redux';

import * as DownloadUtils from '~/components/downloads/downloadUtils';
import { checkAccessibility, render, screen } from '~/testUtils';

import DownloadOcCliButton from './DownloadOcCliButton';

const downloadButtonText = 'Download OC CLI';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

describe('<DownloadOcCliButton />', () => {
  const useSelectorSpy = jest.spyOn(ReactRedux, 'useSelector');
  const detectOsSpy = jest.spyOn(DownloadUtils, 'detectOS');
  const defaultArchitectureSpy = jest.spyOn(DownloadUtils, 'defaultArchitectureForOS');

  beforeAll(() => {
    useSelectorSpy.mockReturnValue(() => ({
      githubReleases: {
        'openshift-online/ocm-cli': {
          error: false,
          errorDetails: null,
          errorMessage: '',
          fulfilled: false,
          pending: false,
        },
      },
    }));
  });

  it('shows download link when OS is detected and is accessible', async () => {
    // Arrange
    detectOsSpy.mockReturnValueOnce('windows');
    const { container } = render(<DownloadOcCliButton />);

    // Assert
    expect(screen.getByRole('link', { name: downloadButtonText })).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('hides download link when unable to detect an OS', () => {
    // Arrange
    detectOsSpy.mockReturnValueOnce(null);
    render(<DownloadOcCliButton />);

    // Assert
    expect(screen.queryByRole('link', { name: downloadButtonText })).not.toBeInTheDocument();
  });

  it('hides download link when no githubReleases are found in store', () => {
    // Arrange
    useSelectorSpy.mockReturnValueOnce(null);
    render(<DownloadOcCliButton />);

    // Assert
    expect(screen.queryByRole('link', { name: downloadButtonText })).not.toBeInTheDocument();
  });

  it('hides download link when unable to detect an OS architecture', () => {
    // Arrange
    defaultArchitectureSpy.mockReturnValueOnce(undefined);
    render(<DownloadOcCliButton />);

    // Assert
    expect(screen.queryByRole('link', { name: downloadButtonText })).not.toBeInTheDocument();
  });
});
