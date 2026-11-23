import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { AugmentedDemoExperience } from './augmentedModelTypes';
import { rosaHandsOnLinks, UNAUTHORIZED } from './constants';
import { DemoExperienceStatusEnum } from './DemoExperienceModels';
import RosaHandsOnPageContent, { StatusAlert } from './RosaHandsOnPageContent';

const createDemoExperience = (
  overrides: Partial<AugmentedDemoExperience> = {},
): AugmentedDemoExperience => ({
  quota: {
    current: 0,
    limit: 3,
  },
  status: DemoExperienceStatusEnum.Available,
  ...overrides,
});

describe('<RosaHandsOnPageContent />', () => {
  it('shows the request error message when requesting an experience fails', () => {
    render(
      <RosaHandsOnPageContent
        error={null}
        requestError={new Error('Request failed with status 503')}
        loading={false}
        demoExperience={createDemoExperience()}
        onRequestCluster={jest.fn()}
      />,
    );

    expect(screen.getByText('Failed to request an experience')).toBeInTheDocument();
    expect(screen.getByText('Request failed with status 503')).toBeInTheDocument();
  });
});

describe('<StatusAlert />', () => {
  it('shows a contact support mailto link when the experience is unavailable', async () => {
    const { container } = render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: DemoExperienceStatusEnum.Unavailable,
        })}
      />,
    );

    expect(
      screen.getByText(/The demo system is currently unavailable. If this issue persists, you can/),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'contact support' });
    expect(link).toHaveAttribute('href', rosaHandsOnLinks.customerSuccess);

    await checkAccessibility(container);
  });

  it('shows the business email capacity message when the experience is unauthorized', async () => {
    const { container } = render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: DemoExperienceStatusEnum.Unavailable,
          unavailable_reason: UNAUTHORIZED,
        })}
      />,
    );

    expect(
      screen.getByText(
        /You must be logged in with your business email account to access the experience/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('shows a contact support mailto link when the experience failed', async () => {
    const { container } = render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: DemoExperienceStatusEnum.Failed,
        })}
      />,
    );

    expect(
      screen.getByText(
        /We're experiencing an error on our end. This does not affect your quota. Try again and if this issue persists/,
      ),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'contact support' });
    expect(link).toHaveAttribute('href', rosaHandsOnLinks.customerSuccess);

    await checkAccessibility(container);
  });

  it('keeps contact support wording as a mailto link when quota is exceeded', async () => {
    const { container } = render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: 'quota-exceeded',
          quota: {
            current: 3,
            limit: 3,
          },
        })}
      />,
    );

    expect(
      screen.getByText(
        /After 3 launches, you can create ROSA clusters using a pay-as-you-go option/,
      ),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'contact support' });
    expect(link).toHaveAttribute('href', rosaHandsOnLinks.customerSuccess);

    await checkAccessibility(container);
  });

  it('does not show a remaining launches alert when no launches have been used', () => {
    const { container } = render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: DemoExperienceStatusEnum.Available,
          quota: {
            current: 0,
            limit: 3,
          },
        })}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('uses singular launch wording when one launch remains', async () => {
    const { container } = render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: DemoExperienceStatusEnum.Available,
          quota: {
            current: 2,
            limit: 3,
          },
        })}
      />,
    );

    expect(
      screen.getByText(/You have 1 launch remaining. If you have any questions, you can/),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'contact support' });
    expect(link).toHaveAttribute('href', rosaHandsOnLinks.customerSuccess);

    await checkAccessibility(container);
  });

  it('uses plural launches wording when more than one launch remains', () => {
    render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: DemoExperienceStatusEnum.Available,
          quota: {
            current: 1,
            limit: 3,
          },
        })}
      />,
    );

    expect(
      screen.getByText(/You have 2 launches remaining. If you have any questions, you can/),
    ).toBeInTheDocument();
  });

  it('falls back to 0 launches when quota is missing on quota-exceeded', () => {
    render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: 'quota-exceeded',
          quota: undefined,
        } as Partial<AugmentedDemoExperience>)}
      />,
    );

    expect(
      screen.getByText(
        /After 0 launches, you can create ROSA clusters using a pay-as-you-go option/,
      ),
    ).toBeInTheDocument();
  });
});
