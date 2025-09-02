import React from 'react';

import { checkAccessibility, mockRestrictedEnv, render, screen } from '~/testUtils';

import CloudTab from './CloudTab';

const componentText = {
  CREATE_CLUSTER_BUTTON: 'Create cluster',
  LEARN_MORE_OSD_LINK: 'Learn more (new window or tab)',
  CREATE_TRIAL_CLUSTER_BUTTON: 'Create trial cluster',
  VIEW_OSD_QUOTA_LINK: 'View your annual subscriptions quota',
};

const verifyBothSectionsShowing = () => {
  expect(screen.getByRole('heading', { name: 'Managed services' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Run it yourself' })).toBeInTheDocument();
};

/*
buttons in form of [{name:string, visibility:boolean}]
*/

const verifyOSDButtonVisibility = (buttons) => {
  buttons.forEach((button) => {
    const type = [componentText.VIEW_OSD_QUOTA_LINK, componentText.LEARN_MORE_OSD_LINK].includes(
      button.name,
    )
      ? 'link'
      : 'button';

    // Check for OSD button - need to use testID because there are multiple buttons with same tex
    if (button.name === componentText.CREATE_CLUSTER_BUTTON) {
      if (button.visibility) {
        expect(screen.getByTestId('osd-create-cluster-button')).toBeInTheDocument();
      } else {
        expect(screen.queryByTestId('osd-create-cluster-button')).not.toBeInTheDocument();
      }

      return;
    }

    // Check the rest of the buttons
    if (button.visibility) {
      expect(screen.getByRole(type, { name: button.name })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole(type, { name: button.name })).not.toBeInTheDocument();
    }
  });
};

describe('<CloudTab />', () => {
  describe('OSD clusters', () => {
    it('is accessible when both trial and quota are enabled', async () => {
      // Arrange
      const { container } = render(<CloudTab hasOSDQuota trialEnabled />);

      // Assert
      await checkAccessibility(container);
    });

    it('is accessible when trial is disabled and no quota', async () => {
      // Arrange
      const { container } = render(<CloudTab hasOSDQuota={false} trialEnabled={false} />);

      // Assert
      await checkAccessibility(container);
    });

    it('shows two sections, create cluster, and quota link when it has OSD quota', () => {
      // Arrange
      render(<CloudTab hasOSDQuota trialEnabled={false} />);

      // Assert
      verifyBothSectionsShowing();

      verifyOSDButtonVisibility([
        { name: componentText.CREATE_CLUSTER_BUTTON, visibility: true },
        { name: componentText.VIEW_OSD_QUOTA_LINK, visibility: true },
        { name: componentText.LEARN_MORE_OSD_LINK, visibility: false },
        {
          name: componentText.CREATE_TRIAL_CLUSTER_BUTTON,
          visibility: false,
        },
      ]);
    });

    it('shows two sections, learn more link,  and quota link when there is not any OSD quota', () => {
      // Arrange
      render(<CloudTab hasOSDQuota={false} trialEnabled={false} />);

      // Assert
      verifyBothSectionsShowing();

      verifyOSDButtonVisibility([
        { name: componentText.CREATE_CLUSTER_BUTTON, visibility: false },
        { name: componentText.VIEW_OSD_QUOTA_LINK, visibility: true },
        { name: componentText.LEARN_MORE_OSD_LINK, visibility: true },
        {
          name: componentText.CREATE_TRIAL_CLUSTER_BUTTON,
          visibility: false,
        },
      ]);
    });

    it('shows two sections and create OSD trail button when trial is enabled', () => {
      // Arrange
      render(<CloudTab hasOSDQuota={false} trialEnabled />);

      // Assert
      verifyBothSectionsShowing();

      verifyOSDButtonVisibility([
        { name: componentText.CREATE_CLUSTER_BUTTON, visibility: false },
        { name: componentText.VIEW_OSD_QUOTA_LINK, visibility: true },
        { name: componentText.LEARN_MORE_OSD_LINK, visibility: true },
        {
          name: componentText.CREATE_TRIAL_CLUSTER_BUTTON,
          visibility: true,
        },
      ]);
    });

    it('shows  two sections, create OSD button, create OSD trial, and quota link when  both trial enabled and OSD quota', () => {
      // Arrange
      render(<CloudTab hasOSDQuota trialEnabled />);

      // Assert
      verifyBothSectionsShowing();

      verifyOSDButtonVisibility([
        { name: componentText.CREATE_CLUSTER_BUTTON, visibility: true },
        { name: componentText.VIEW_OSD_QUOTA_LINK, visibility: true },
        { name: componentText.LEARN_MORE_OSD_LINK, visibility: false },
        {
          name: componentText.CREATE_TRIAL_CLUSTER_BUTTON,
          visibility: true,
        },
      ]);
    });
  });

  describe('in Restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();
    const props = {
      hasOSDQuota: false,
      trialEnabled: false,
    };

    afterEach(() => {
      isRestrictedEnv.mockReturnValue(false);
    });
    it('renders only ROSA cluster', () => {
      isRestrictedEnv.mockReturnValue(true);
      render(<CloudTab {...props} />);

      expect(screen.getAllByRole('row')).toHaveLength(2);
      expect(screen.getByTestId('rosa-create-cluster-button')).toBeInTheDocument();
    });
  });
});
