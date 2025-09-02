import { render, screen } from '~/testUtils';

import { AdvancedClusterSecurityDrawerPanelBody } from '../../components/common/DrawerPanelContents/AdvancedClusterSecurity/DrawerPanelBody';

import '@testing-library/jest-dom';

describe('<AdvancedClusterSecurityDrawerPanelHead />', () => {
  it('renders elements', async () => {
    // Arrange
    render(AdvancedClusterSecurityDrawerPanelBody);

    // Assert
    expect(
      screen.getByText(
        /Security shouldn’t be an afterthought. Build, deploy, and run your cloud-native/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Conduct security sooner by automating DevSecOps and mitigating security issues early in/i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByTestId('drawer-panel-content__explanation-video')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/lFBFW3HmgsA',
    );

    expect(screen.getByText(/Video duration 2:21/i)).toBeInTheDocument();

    const benefitsTitle = screen.getByTestId('drawer-panel-content-benefits-title');
    expect(benefitsTitle).toBeInTheDocument();
    expect(benefitsTitle).toHaveTextContent('Benefits');

    expect(screen.getByText(/Lower operational cost:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Reduce cost by catching and fixing a security issue in the development stage./i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reduce operational risk:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Align security and infrastructure to reduce application downtime using built-in Kubernetes capabilities./i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ensure compliance standards:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Enable compliance with built-in checks for critical security standards and regulations/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Find threats quicker:/i)).toBeInTheDocument();
    expect(screen.getByText(/Detect and respond to threats, such as:/i)).toBeInTheDocument();

    const threatExampleListItems = screen.getAllByTestId('threat-example-list-item');
    const threatExampleExpectedItems = [
      'Unauthorized access',
      'Cryptomining',
      'Privilege escalation',
      'Lateral movement',
    ];

    expect(threatExampleListItems).toHaveLength(threatExampleExpectedItems.length);
    for (let i = 0; i < threatExampleExpectedItems.length; i += 1) {
      expect(threatExampleListItems[i]).toHaveTextContent(threatExampleExpectedItems[i]);
    }

    expect(screen.getByText('Use cases:')).toBeInTheDocument();

    expect(screen.getByText(/Supply chain security:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Provide developers with security context in their existing workflows and integrate security/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Infrastructure security:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Maintain security and prevent insecure access and authorizations with existing/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Workload security:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Prevent high-risk workloads from being deployed or run using out-of-the-box deploy-time/i,
      ),
    ).toBeInTheDocument();

    const learnMoreBtn = screen.getByTestId(
      'learn-more-about-advanced-cluster-security-drawer-panel-content-link',
    );
    expect(learnMoreBtn).toBeInTheDocument();
    expect(learnMoreBtn).toHaveTextContent('Learn more about Advanced Cluster Security');
    expect(learnMoreBtn).toHaveAttribute(
      'href',
      'https://catalog.redhat.com/software/container-stacks/detail/60eefc88ee05ae7c5b8f041c',
    );
  });
});
