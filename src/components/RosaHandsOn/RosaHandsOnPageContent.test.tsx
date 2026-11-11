import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { AugmentedDemoExperience } from './augmentedModelTypes';
import { rosaHandsOnLinks, UNAUTHORIZED } from './constants';
import { DemoExperienceStatusEnum } from './DemoExperienceModels';
import { StatusAlert } from './RosaHandsOnPageContent';

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

describe('<StatusAlert />', () => {
  it('shows the business email capacity message when the experience is unavailable', async () => {
    const { container } = render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: DemoExperienceStatusEnum.Unavailable,
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

  it('shows an email support mailto link when the experience is unauthorized', async () => {
    const { container } = render(
      <StatusAlert
        demoExperience={createDemoExperience({
          status: DemoExperienceStatusEnum.Unavailable,
          unavailable_reason: UNAUTHORIZED,
        })}
      />,
    );

    expect(
      screen.getByText(/Let's get you access to the Hands-on Experience. To continue, you can/),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'email support' });
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
});
