import React from 'react';

import * as locationUtils from '~/common/location';
import { checkAccessibility, render, screen, within } from '~/testUtils';

import ExternalLink from './ExternalLink';

const useAnalyticsMock = jest.fn();
jest.mock('~/hooks/useAnalytics', () => jest.fn(() => useAnalyticsMock));

describe('<ExternalLink />', () => {
  it('is accessible as a link', async () => {
    // Arrange
    const { container } = render(
      <ExternalLink href="http://example.com">Hello World</ExternalLink>,
    );

    // Assert
    await checkAccessibility(container);
  });

  it('is accessible as a button', async () => {
    // Arrange
    const { container } = render(
      <ExternalLink href="http://example.com" isButton>
        Hello World
      </ExternalLink>,
    );

    // Assert
    await checkAccessibility(container);
  });

  it('shows as a secondary button but is still a link', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" isButton>
        Hello World
      </ExternalLink>,
    );

    // Assert
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('class')).toMatch(/pf-v6-c-button/);
    expect(screen.getByRole('link').getAttribute('class')).toMatch(/secondary/);
  });

  it('shows as a primary button when variant is set', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" isButton variant="primary">
        Hello World
      </ExternalLink>,
    );

    // Assert
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('class')).toMatch(/pf-v6-c-button/);
    expect(screen.getByRole('link').getAttribute('class')).toMatch(/primary/);
  });

  it('shows children  and href is set as link', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" className="myClassName">
        Hello World
      </ExternalLink>,
    );

    // Assert
    expect(within(screen.getByRole('link')).getByText(/Hello World/)).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toEqual('http://example.com');
    expect(screen.getByRole('link').getAttribute('class')).toMatch(/myClassName/);
  });

  it('shows children and href is set as button', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" isButton className="myClassName">
        Hello World
      </ExternalLink>,
    );

    // Assert
    expect(within(screen.getByRole('link')).getByText(/Hello World/)).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toEqual('http://example.com');
    expect(screen.getByRole('link').getAttribute('class')).toMatch(/myClassName/);
  });

  it('shows (new window or tab) to screenreaders if link', () => {
    // Arrange
    render(<ExternalLink href="http://example.com">Hello World</ExternalLink>);

    // Assert
    expect(screen.getByText(/\(new window or tab\)/)).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('target')).toEqual('_blank');
  });

  it('shows (new window or tab) to screenreaders if button', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" isButton>
        Hello World
      </ExternalLink>,
    );

    // Assert
    expect(screen.getByText(/\(new window or tab\)/)).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('target')).toEqual('_blank');
  });

  it('hides (new window or tab) if noTarget is set and is link', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" noTarget>
        Hello World
      </ExternalLink>,
    );

    // Assert
    expect(screen.queryByText(/\(new window or tab\)/)).not.toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('target')).toEqual('');
  });

  it('hides (new window or tab) if noTarget is set and is button', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" noTarget isButton>
        Hello World
      </ExternalLink>,
    );

    // Assert
    expect(screen.queryByText(/\(new window or tab\)/)).not.toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('target')).toEqual('');
  });

  it('shows new window icon if link', () => {
    // Arrange
    render(<ExternalLink href="http://example.com">Hello World</ExternalLink>);

    // Assert
    // PF doesn't have a unique role or text to identify the icon
    expect(screen.getByTestId('openInNewWindowIcon')).toBeInTheDocument();
  });

  it('shows new window icon if button', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" isButton>
        Hello World
      </ExternalLink>,
    );

    // Assert
    // PF doesn't have a unique role or text to identify the icon
    expect(screen.getByTestId('openInNewWindowIcon')).toBeInTheDocument();
  });

  it('hides new window icon if link', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" noIcon>
        Hello World
      </ExternalLink>,
    );

    // Assert
    // PF doesn't have a unique role or text to identify the icon
    expect(screen.queryByTestId('openInNewWindowIcon')).not.toBeInTheDocument();
  });

  it('hides new window icon if button', () => {
    // Arrange
    render(
      <ExternalLink href="http://example.com" noIcon isButton>
        Hello World
      </ExternalLink>,
    );

    // Assert
    // PF doesn't have a unique role or text to identify the icon
    expect(screen.queryByTestId('openInNewWindowIcon')).not.toBeInTheDocument();
  });

  describe('useAnalytics', () => {
    let locationSpy: jest.SpyInstance;

    beforeEach(() => {
      locationSpy = jest.spyOn(locationUtils, 'getLocation');
      useAnalyticsMock.mockClear();
    });

    afterEach(() => {
      locationSpy.mockRestore();
    });

    it('is called for unknown pathname', async () => {
      // Arrange
      locationSpy.mockReturnValue({ pathname: '/foo' });
      const { user } = render(<ExternalLink href="http://example.com">Hello World</ExternalLink>);

      // Act
      await user.click(screen.getByRole('link'));

      // Assert
      expect(useAnalyticsMock).toHaveBeenCalled();
      expect(useAnalyticsMock).toHaveBeenCalledWith(
        { event: 'Link Clicked', link_name: 'external-link' },
        {
          customProperties: {
            link_url: 'http://example.com',
            module: 'openshift',
            ocm_resource_type: 'all',
          },
        },
      );
    });

    it('is called for rosa pathname', async () => {
      // Arrange
      locationSpy.mockReturnValue({ pathname: '/rosa' });
      const { user } = render(<ExternalLink href="http://example.com">Hello World</ExternalLink>);

      // Act
      await user.click(screen.getByRole('link'));

      // Arrange
      expect(useAnalyticsMock).toHaveBeenCalled();
      expect(useAnalyticsMock).toHaveBeenCalledWith(
        { event: 'Link Clicked', link_name: 'external-link' },
        {
          customProperties: {
            link_url: 'http://example.com',
            module: 'openshift',
            ocm_resource_type: 'moa',
          },
        },
      );
    });

    it('is called for osd trial pathname', async () => {
      // Arrange
      locationSpy.mockReturnValue({ pathname: '/osdtrial' });
      const { user } = render(<ExternalLink href="http://example.com">Hello World</ExternalLink>);

      // Act
      await user.click(screen.getByRole('link'));

      // Assert
      expect(useAnalyticsMock).toHaveBeenCalled();
      expect(useAnalyticsMock).toHaveBeenCalledWith(
        { event: 'Link Clicked', link_name: 'external-link' },
        {
          customProperties: {
            link_url: 'http://example.com',
            module: 'openshift',
            ocm_resource_type: 'osdtrial',
          },
        },
      );
    });

    it('is called for osd pathname', async () => {
      // Arrange
      locationSpy.mockReturnValue({ pathname: '/osd' });
      const { user } = render(<ExternalLink href="http://example.com">Hello World</ExternalLink>);

      // Act
      await user.click(screen.getByRole('link'));

      // Assert
      expect(useAnalyticsMock).toHaveBeenCalled();
      expect(useAnalyticsMock).toHaveBeenCalledWith(
        { event: 'Link Clicked', link_name: 'external-link' },
        {
          customProperties: {
            link_url: 'http://example.com',
            module: 'openshift',
            ocm_resource_type: 'osd',
          },
        },
      );
    });

    it('is called for crc pathname', async () => {
      // Arrange
      locationSpy.mockReturnValue({ pathname: '/crc' });
      const { user } = render(<ExternalLink href="http://example.com">Hello World</ExternalLink>);

      // Act
      await user.click(screen.getByRole('link'));

      // Assert
      expect(useAnalyticsMock).toHaveBeenCalled();
      expect(useAnalyticsMock).toHaveBeenCalledWith(
        { event: 'Link Clicked', link_name: 'external-link' },
        {
          customProperties: {
            link_url: 'http://example.com',
            module: 'openshift',
            ocm_resource_type: 'crc',
          },
        },
      );
    });
    it('is called with custom tracking properties', async () => {
      // Arrange
      locationSpy.mockReturnValue({ pathname: '/crc' });
      const customProps = {
        current_path: '/openshift/details/s',
        tab_title: 'Add-ons',
        tab_id: 'addOnsTabContent',
        card_type: 'addon',
        addon_id: '12345',
        resource_id: '67890',
        ocm_cluster_id: 'e-12345',
        ocm_resource_type: 'osd',
      };
      const { user } = render(
        <ExternalLink href="http://example.com" customTrackProperties={customProps}>
          Hello World
        </ExternalLink>,
      );

      // Act
      await user.click(screen.getByRole('link'));

      // Assert
      expect(useAnalyticsMock).toHaveBeenCalled();
      expect(useAnalyticsMock).toHaveBeenCalledWith(
        { event: 'Link Clicked', link_name: 'external-link' },
        {
          customProperties: {
            link_url: 'http://example.com',
            module: 'openshift',
            ...customProps,
          },
        },
      );
    });
  });
});
