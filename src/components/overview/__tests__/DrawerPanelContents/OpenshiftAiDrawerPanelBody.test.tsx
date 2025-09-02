import { render, screen } from '~/testUtils';

import { OpenShiftAiDrawerPanelBody } from '../../components/common/DrawerPanelContents/OpenshiftAi/DrawerPanelBody';

import '@testing-library/jest-dom';

describe('<OpenShiftAiDrawerPanelBody />', () => {
  it('renders elements', async () => {
    // Arrange
    render(OpenShiftAiDrawerPanelBody);

    // Assert
    expect(
      screen.getByText(
        /Build, train, tune, and deploy AI models at scale across hybrid cloud environments with/i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByTestId('drawer-panel-content__explanation-video')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/JGesQwL-lkg',
    );

    expect(screen.getByText(/Video duration 5:26/i)).toBeInTheDocument();

    const benefitsTitle = screen.getByTestId('drawer-panel-content-benefits-title');
    expect(benefitsTitle).toBeInTheDocument();
    expect(benefitsTitle).toHaveTextContent('Benefits');

    expect(screen.getByText(/Innovate faster:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Iterate and experiment quickly with a single platform for the entire AI platform./i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Scale easily:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Built on Kubernetes, OpenShift AI allows for easy scaling of AI/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Enhance collaboration:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Bring together your data scientist, operations, and developer teams in a unified AI platform./i,
      ),
    ).toBeInTheDocument();

    const capabilitiesTitle = screen.getByTestId('drawer-panel-content-capabilities-title');
    expect(capabilitiesTitle).toBeInTheDocument();
    expect(capabilitiesTitle).toHaveTextContent('Capabilities');

    expect(screen.getByText(/Model training- projects:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Organize model development files, data connections, and other artifacts needed for a given project./i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/Model training- distributed workloads:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Leverage multiple cluster nodes simultaneously for faster, more efficient model training./i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/Notebook images:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Choose from a default set of pre-configured notebook images or use your own custom notebook images./i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/Model serving:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Data scientists can deploy trained machine-learning models to serve intelligent applications in production./i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/Accelerators:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Scale your work, reduce latency, and increase productivity with NVIDIA graphics processing units/i,
      ),
    ).toBeInTheDocument();

    const cloudsAndPlatformsTitle = screen.getByTestId(
      'drawer-panel-content-clouds-and-platforms-title',
    );
    expect(cloudsAndPlatformsTitle).toBeInTheDocument();
    expect(cloudsAndPlatformsTitle).toHaveTextContent('Clouds and platforms');

    expect(
      screen.getByText(
        /You can choose where to develop and deploy your models. Red Hat OpenShift AI lets you choose the environment that best suits your needs from:/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('On-premise (including disconnected environments)'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Any major public cloud, such as:/i)).toBeInTheDocument();

    const majorPublicCloudListItems = screen.getAllByTestId('major-public-cloud-list-item');
    const majorPublicCloudExpectedItems = [
      'Microsoft Azure Kubernetes Service (AKS)',
      'Google Cloud Platform (GCP)',
      'Amazon Web Services (AWS)',
      'IBM Cloud Platform',
    ];

    expect(majorPublicCloudListItems).toHaveLength(majorPublicCloudExpectedItems.length);
    for (let i = 0; i < majorPublicCloudExpectedItems.length; i += 1) {
      expect(majorPublicCloudListItems[i]).toHaveTextContent(majorPublicCloudExpectedItems[i]);
    }

    const learnMoreBtn = screen.getByTestId(
      'learn-more-about-redhat-openshift-ai-drawer-panel-content-link',
    );
    expect(learnMoreBtn).toBeInTheDocument();
    expect(learnMoreBtn).toHaveTextContent('Learn more about Red Hat OpenShift AI');
    expect(learnMoreBtn).toHaveAttribute(
      'href',
      'https://catalog.redhat.com/software/container-stacks/detail/63b85b573112fe5a95ee9a3a',
    );
  });
});
