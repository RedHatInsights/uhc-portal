import React from 'react';

import { checkAccessibility, getByText, render, screen } from '~/testUtils';

import { ServicePage } from './ServicePage';

describe('Service page unit tests', () => {
  describe('ROSA Service Page', () => {
    it('is accessible', async () => {
      const { container } = render(<ServicePage serviceName="ROSA" />);
      await checkAccessibility(container);
    });

    it('has the right breadcrumb text', () => {
      render(<ServicePage serviceName="ROSA" />);

      const breadcrumbsNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(getByText(breadcrumbsNav, 'Red Hat OpenShift Service on AWS')).toBeInTheDocument();
    });

    it('has a link for "begin setup"', () => {
      render(<ServicePage serviceName="ROSA" />);

      expect(screen.getByText('Begin setup', { selector: 'span' }).parentElement).toHaveAttribute(
        'href',
        '/openshift/create/rosa/getstarted',
      );
    });

    it('has a working link for "self-service deployment"', async () => {
      const { user } = render(<ServicePage serviceName="ROSA" />);

      const selfServiceButton = screen.getByText('Self-service deployment');
      await user.click(selfServiceButton);
      expect(
        screen.getByText(
          'Create fully-managed OpenShift clusters in minutes so you can get up and running quickly.',
        ),
      ).toBeVisible();
    });

    it('has a working link for "seamless integration"', async () => {
      const { user } = render(<ServicePage serviceName="ROSA" />);
      const seamlessIntegrationButton = screen.getByText(
        'Seamless integration with other AWS services',
      );
      await user.click(seamlessIntegrationButton);
      expect(
        screen.getByText(
          'A native AWS service accessed on demand from the AWS Management Console. Take advantage of seamless integration with other AWS cloud native services.',
        ),
      ).toBeVisible();
    });

    it('has a working link for "maximum availability"', async () => {
      const { user } = render(<ServicePage serviceName="ROSA" />);
      const maximumAvailabilityButton = screen.getByText('Maximum availability');
      await user.click(maximumAvailabilityButton);
      expect(
        screen.getByText(
          'Deploy clusters across multiple Availability Zones in supported regions to maximize availability.',
        ),
      ).toBeVisible();
    });

    it('has a working link for "deploying applications"', async () => {
      const { user } = render(<ServicePage serviceName="ROSA" />);

      const deployApplicationsButton = screen.getByText(
        'Deploy applications where they need to be',
      );
      await user.click(deployApplicationsButton);
      expect(
        screen.getByText(
          'Red Hat OpenShift Service on AWS delivers the production-ready application platform that many enterprises already use on-premises, simplifying the ability to shift workloads to the AWS public cloud as business needs dictate.',
        ),
      );

      const flexibleConsumptionButton = screen.getByText('Flexible consumption-based pricing');
      await user.click(flexibleConsumptionButton);
      expect(
        screen.getByText(
          'Scale as per your business needs and pay as you go with flexible pricing with an on-demand hourly or annual billing model.',
        ),
      );

      const fullyManagedButton = screen.getByText('Fully-managed service');
      await user.click(fullyManagedButton);
      expect(
        screen.getByText(
          'Fully-managed OpenShift service, backed by a global Site Reliability Engineering (SRE) team and an enterprise class SLA, enabling customers to focus on applications, not managing infrastructure.',
        ),
      );

      expect(screen.getByText('Learn more about pricing', { selector: 'a' })).toHaveAttribute(
        'href',
        'https://aws.amazon.com/rosa/pricing',
      );
    });

    it('has a working link for "flexible consumption"', async () => {
      const { user } = render(<ServicePage serviceName="ROSA" />);

      const flexibleConsumptionButton = screen.getByText('Flexible consumption-based pricing');
      await user.click(flexibleConsumptionButton);
      expect(
        screen.getByText(
          'Scale as per your business needs and pay as you go with flexible pricing with an on-demand hourly or annual billing model.',
        ),
      );
    });

    it('has a working link for "fully-managed service"', async () => {
      const { user } = render(<ServicePage serviceName="ROSA" />);

      const fullyManagedButton = screen.getByText('Fully-managed service');
      await user.click(fullyManagedButton);
      expect(
        screen.getByText(
          'Fully-managed OpenShift service, backed by a global Site Reliability Engineering (SRE) team and an enterprise class SLA, enabling customers to focus on applications, not managing infrastructure.',
        ),
      );

      expect(screen.getByText('Learn more about pricing', { selector: 'a' })).toHaveAttribute(
        'href',
        'https://aws.amazon.com/rosa/pricing',
      );
    });
  });

  describe('OSD Service Page', () => {
    it('is accessible', async () => {
      const { container } = render(<ServicePage serviceName="OSD" />);
      await checkAccessibility(container);
    });

    it('has the right breadcrumb text', () => {
      render(<ServicePage serviceName="OSD" />);

      const breadcrumbsNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(getByText(breadcrumbsNav, 'Red Hat OpenShift Dedicated')).toBeInTheDocument();
    });

    it('has a link for "create OSD cluster"', () => {
      render(<ServicePage serviceName="OSD" />);

      expect(
        screen.getByText('Create cluster', { selector: 'span' }).parentElement,
      ).toHaveAttribute('href', '/openshift/create/osd');
    });

    it('has a link for "interactive walkthrough"', () => {
      render(<ServicePage serviceName="OSD" />);

      expect(screen.getByText('Go to interactive walkthrough', { selector: 'a' })).toHaveAttribute(
        'href',
        'https://www.redhat.com/en/products/interactive-walkthrough/install-openshift-dedicated-google-cloud',
      );
    });

    it('has working links for benefits', async () => {
      const { user } = render(<ServicePage serviceName="OSD" />);

      const accelerateTimeButton = screen.getByText('Accelerate time to value');
      await user.click(accelerateTimeButton);
      expect(
        screen.getByText(
          'Quickly build, deploy, and manage applications at scale with a comprehensive application platform.',
        ),
      ).toBeVisible();

      const focusOnInnovationButton = screen.getByText('Focus on innovation');
      await user.click(focusOnInnovationButton);
      expect(
        screen.getByText(
          'Simplify delivering, operating, and scaling workloads with automated deployment and proactive management of OpenShift clusters.',
        ),
      ).toBeVisible();

      const hybridCloudFlexibilityButton = screen.getByText('Gain hybrid cloud flexibility');
      await user.click(hybridCloudFlexibilityButton);
      expect(
        screen.getByText(
          'Get a consistent Red Hat OpenShift experience across the hybrid cloud for developers and operations teams.',
        ),
      ).toBeVisible();
    });

    it('has a working links for "features"', async () => {
      const { user } = render(<ServicePage serviceName="OSD" />);

      const applicationPlatformButton = screen.getByText('Comprehensive application platform');
      await user.click(applicationPlatformButton);
      expect(
        screen.getByText(
          'Fully integrated development and operational productivity features, such as Integrated Development Environment (IDE), monitoring and service mesh, runtimes, build pipelines, and more.',
        ),
      );

      const expertSupportButton = screen.getByText('Expert support');
      await user.click(expertSupportButton);
      expect(
        screen.getByText(
          'Engineered, operated, and supported by Red Hat site reliability engineering (SRE) with a 99.95% uptime service-level agreement (SLA) and 24x7 coverage.',
        ),
      );

      const billingAndProcurementButton = screen.getByText('Streamlined billing and procurement');
      await user.click(billingAndProcurementButton);
      expect(
        screen.getByText(
          'Receive a single bill for both the Red Hat OpenShift service and Google CloudPlatform infrastructure consumption.',
        ),
      );

      const highAvailArchButton = screen.getByText('High availability architecture');
      await user.click(highAvailArchButton);
      expect(
        screen.getByText(
          'Deploy clusters with multiple masters and infrastructure nodes across multiple availability zones in supported regions to ensure maximum availability and continuous operation.',
        ),
      );

      expect(screen.getByText('Learn more about pricing', { selector: 'a' })).toHaveAttribute(
        'href',
        'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated?intcmp=7013a000003DQeVAAW#pricing',
      );
    });
  });
});
