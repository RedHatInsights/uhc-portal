import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import links from '../../../../../../common/installLinks.mjs';

import RHCOSDownloadAndSelect from './RHCOSDownloadAndSelect';

const rhcosOptions = {
  downloads: [
    {
      buttonText: 'Download RHCOS ISO',
      name: 'OCP-Download-RHCOS-ISO',
      archURL: links.RHCOS_GENERIC_ISO_X86,
    },
    {
      buttonText: 'Download RHCOS kernel',
      name: 'OCP-Download-RHCOS-kernel',
      archURL: links.RHCOS_GENERIC_KERNEL_X86,
    },
    {
      buttonText: 'Download RHCOS initramfs',
      name: 'OCP-Download-RHCOS-initramfs',
      archURL: links.RHCOS_GENERIC_INITRAMFS_X86,
    },
    {
      buttonText: 'Download RHCOS rootfs',
      name: 'OCP-Download-RHCOS-rootfs',
      archURL: links.RHCOS_GENERIC_ROOTFS_X86,
    },
  ],
};

const defaultProps = {
  token: { id: 'mockToken', error: false },
  pendoID: '/openshift/install/metal/user-provisioned',
  rhcosDownloads: rhcosOptions.downloads,
};

describe('<RHCOSDownloadAndSelect />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(<RHCOSDownloadAndSelect {...defaultProps} />);

    await checkAccessibility(container);
  });

  it('displays the button options', () => {
    render(<RHCOSDownloadAndSelect {...defaultProps} />);

    expect(screen.getByText('Download RHCOS ISO')).toBeInTheDocument();
    expect(screen.getByText('Download RHCOS kernel')).toBeInTheDocument();
    expect(screen.getByText('Download RHCOS initramfs')).toBeInTheDocument();
    expect(screen.getByText('Download RHCOS rootfs')).toBeInTheDocument();
  });

  it('displays the arch options', () => {
    render(<RHCOSDownloadAndSelect {...defaultProps} />);

    expect(screen.getByText('Select architecture')).toBeInTheDocument();
    expect(screen.getByText('Select architecture')).toBeDisabled();
    expect(screen.getByText('x86_64')).toBeInTheDocument();
    expect(screen.getByText('aarch64')).toBeInTheDocument();
    expect(screen.getByText('ppc64le')).toBeInTheDocument();
    expect(screen.getByText('s390x')).toBeInTheDocument();
  });
});
