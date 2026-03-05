import React from 'react';
import { Formik } from 'formik';

import { useWizardContext } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import {
  DISABLED_NO_PROXY_PLACEHOLDER,
  NO_PROXY_PLACEHOLDER,
} from '~/components/clusters/common/networkingConstants';
import { checkAccessibility, render, screen } from '~/testUtils';

import ClusterProxyScreen from './ClusterProxyScreen';
import { FieldId } from './constants';

jest.mock('@patternfly/react-core', () => ({
  __esModule: true,
  ...jest.requireActual('@patternfly/react-core'),
  useWizardContext: jest.fn(() => ({
    goToStepByName: jest.fn(),
  })),
}));

// Normally wouldn't mock children - but this component throws all sort of errors
// when tests are run
jest.mock('~/components/common/ReduxFormComponents_deprecated/ReduxFileUpload', () => () => (
  <div data-testid="mocked-upload">MOCKED UPLOAD</div>
));

// Formik wrapper to provide context for useFormState
const buildTestComponent = (isHypershiftSelected, formValues = {}) => (
  <Formik
    initialValues={{
      [FieldId.HttpProxyUrl]: '',
      [FieldId.HttpsProxyUrl]: '',
      [FieldId.NoProxyDomains]: '',
      [FieldId.AdditionalTrustBundle]: '',
      ...formValues,
    }}
    onSubmit={jest.fn()}
  >
    <ClusterProxyScreen isHypershiftSelected={isHypershiftSelected} />
  </Formik>
);

describe('<ClusterProxyScreen />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders expected labels and help', async () => {
    render(buildTestComponent());

    expect(screen.getByText('Cluster-wide proxy')).toBeInTheDocument();
    expect(screen.getByText('Configure at least 1 of the following fields:')).toBeInTheDocument();

    // Labels exist
    expect(screen.getByLabelText('HTTP proxy URL')).toBeInTheDocument();
    expect(screen.getByLabelText('HTTPS proxy URL')).toBeInTheDocument();
    expect(screen.getByLabelText('No Proxy domains')).toBeInTheDocument();
    expect(screen.getByText('MOCKED UPLOAD')).toBeInTheDocument();
  });

  it('renders rosa HCP documentation link when hypershift is selected', async () => {
    render(buildTestComponent(true));

    const learnMoreLink = screen.getByText('Learn more about configuring a cluster-wide proxy');
    expect(learnMoreLink).toHaveAttribute('href', links.ROSA_CLUSTER_WIDE_PROXY);
  });

  it('renders rosa classic documentation link when classic is selected', async () => {
    render(buildTestComponent());

    const learnMoreLink = screen.getByText('Learn more about configuring a cluster-wide proxy');
    expect(learnMoreLink).toHaveAttribute('href', links.ROSA_CLASSIC_CLUSTER_WIDE_PROXY);
  });

  it('disables No Proxy domains when no HTTP/HTTPS URLs are set and shows disabled placeholder', async () => {
    render(buildTestComponent());
    const noProxy = screen.getByLabelText('No Proxy domains');
    expect(noProxy).toBeDisabled();
    expect(noProxy).toHaveAttribute('placeholder', DISABLED_NO_PROXY_PLACEHOLDER);
  });

  it('enables No Proxy domains and changes placeholder when HTTP proxy URL is provided', async () => {
    const { user } = render(buildTestComponent());
    const httpInput = screen.getByLabelText('HTTP proxy URL');
    const noProxy = screen.getByLabelText('No Proxy domains');

    await user.type(httpInput, 'http://example.com:8080');

    expect(noProxy).not.toBeDisabled();
    expect(noProxy).toHaveAttribute('placeholder', NO_PROXY_PLACEHOLDER);
  });

  it('shows warning prompting to complete at least one field after a field is blurred empty', async () => {
    const { user } = render(buildTestComponent());
    const httpInput = screen.getByLabelText('HTTP proxy URL');

    // Focus then blur without entering a value to set anyTouched
    await user.click(httpInput);
    await user.tab();

    expect(screen.getByText(/Complete at least 1 of the fields above\./i)).toBeInTheDocument();
  });

  it('navigates to Networking > Configuration when clicking the alert action link', async () => {
    const goToStepByName = jest.fn();
    useWizardContext.mockReturnValue({ goToStepByName });

    const { user } = render(buildTestComponent());
    const httpInput = screen.getByLabelText('HTTP proxy URL');
    await user.click(httpInput);
    await user.tab();

    const backLink = screen.getByRole('button', {
      name: 'Back to the networking configuration',
    });
    await user.click(backLink);
    expect(goToStepByName).toHaveBeenCalledWith('Configuration');
  });

  it('hides the warning when Additional trust bundle has content', async () => {
    const { user } = render(
      buildTestComponent(false, {
        [FieldId.AdditionalTrustBundle]: 'I am a trust bundle',
      }),
    );

    // Touch a field to trigger anyTouched
    const httpInput = screen.getByLabelText('HTTP proxy URL');
    await user.click(httpInput);
    await user.tab();

    // Since trust bundle has content, no warning should appear
    expect(
      screen.queryByText(/Complete at least 1 of the fields above\./i),
    ).not.toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(buildTestComponent());
    await checkAccessibility(container);
  });
});
