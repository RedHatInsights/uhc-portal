import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { ArmAWSIPIProps, ArmPreReleaseProps } from './InstallProps/InstallArmPropsData';
import { AlibabaProps, PullSecretProps } from './InstallProps/InstallWrapperPropsData';
import { InstallComponentWrapper } from './InstallWrapper';

describe('Install generic component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Installer wrapper', () => {
    // html violations in Patternfly component
    it.skip('is accessible', async () => {
      const { container } = render(
        <InstallComponentWrapper propsData={ArmAWSIPIProps} componentChooser="ocpInstructions" />,
      );

      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
      await checkAccessibility(container);
    });

    it('renders OCP Instructions component', async () => {
      render(
        <InstallComponentWrapper propsData={ArmAWSIPIProps} componentChooser="ocpInstructions" />,
      );

      const title = await screen.findByText('Amazon Web Services (ARM)');
      expect(title).toBeInTheDocument();
    });

    it('renders Instruction Chooser component', async () => {
      render(
        <InstallComponentWrapper propsData={AlibabaProps} componentChooser="instructionsChooser" />,
      );

      const title = await screen.findByText('Alibaba Cloud');
      expect(title).toBeInTheDocument();
    });

    it('renders PreRelease Chooser component', async () => {
      render(
        <InstallComponentWrapper
          propsData={ArmPreReleaseProps}
          componentChooser="releaseInstructions"
        />,
      );

      const title = await screen.findByText('Install OpenShift Container Platform 4 on ARM');
      expect(title).toBeInTheDocument();
    });

    it('renders Pull Secret Component', async () => {
      render(
        <InstallComponentWrapper
          propsData={PullSecretProps}
          componentChooser="pullSecretInstructions"
        />,
      );

      const title = await screen.findByText('Install OpenShift Container Platform 4');
      expect(title).toBeInTheDocument();
    });
  });
});
