import React from 'react';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';

import { AugmentedDemoExperience } from './augmentedModelTypes';
import { rosaHandsOnLinks } from './constants';
import { DemoExperienceStatusEnum } from './DemoExperienceModels';
import RosaHandsOnGetStartedCard from './RosaHandsOnGetStartedCard';

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

describe('<RosaHandsOnGetStartedCard />', () => {
  it('is accessible on initial render', async () => {
    const { container } = render(
      <RosaHandsOnGetStartedCard
        demoExperience={createDemoExperience()}
        onRequestCluster={jest.fn()}
      />,
    );

    await checkAccessibility(container);
  });

  it('shows customer success mailto and Slack links in the What to expect popover', async () => {
    const user = userEvent.setup();
    render(
      <RosaHandsOnGetStartedCard
        demoExperience={createDemoExperience()}
        onRequestCluster={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'What to expect help' }));

    expect(screen.getByText(/You may launch a demo up to/)).toBeInTheDocument();
    expect(screen.getByText('3 times')).toBeInTheDocument();

    const customerSuccessLink = screen.getByRole('link', { name: 'customer success team' });
    expect(customerSuccessLink).toHaveAttribute('href', rosaHandsOnLinks.customerSuccess);

    const slackLink = screen.getByRole('link', { name: /ROSA community Slack channel/ });
    expect(slackLink).toHaveAttribute('href', rosaHandsOnLinks.slackChannel);
  });

  it('shows the Create a ROSA cluster CTA when quota is exceeded', async () => {
    const { container } = render(
      <RosaHandsOnGetStartedCard
        demoExperience={createDemoExperience({
          status: 'quota-exceeded',
          quota: {
            current: 3,
            limit: 3,
          },
        })}
        onRequestCluster={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Take the next step. Create your own ROSA Cluster!' }),
    ).toBeInTheDocument();

    const createClusterLink = screen.getByRole('link', { name: 'Create a ROSA cluster' });
    expect(createClusterLink).toHaveAttribute(
      'href',
      expect.stringMatching(new RegExp(`${rosaHandsOnLinks.getStarted}$`)),
    );

    await checkAccessibility(container);
  });
});
