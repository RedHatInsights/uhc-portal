import React from 'react';
import { Formik } from 'formik';

import {
  HTTP_PROXY_PLACEHOLDER,
  HTTPS_PROXY_PLACEHOLDER,
} from '~/components/clusters/common/networkingConstants';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { render, screen } from '~/testUtils';

import { ClusterProxy } from './ClusterProxy';

jest.mock('@patternfly/react-core', () => ({
  ...jest.requireActual('@patternfly/react-core'),
  useWizardContext: jest.fn(() => ({
    goToStepByName: jest.fn(),
    activeStep: { name: 'mockStepId' },
  })),
}));

const renderTestComponent = (formValues = {}) =>
  render(
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
      <ClusterProxy />
    </Formik>,
  );

describe('<ClusterProxy />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('https URL validation fails when entering http URL', async () => {
    const { user } = renderTestComponent();

    const textBox = screen.getByPlaceholderText(HTTPS_PROXY_PLACEHOLDER);
    await user.type(textBox, 'http://example.com');
    await user.click(screen.getByPlaceholderText(HTTP_PROXY_PLACEHOLDER));

    expect(
      screen.getByText('The URL should include the scheme prefix (https://)', { exact: false }),
    ).toBeInTheDocument();
  });

  it('https URL validation succeeds when entering https URL', async () => {
    const { user } = renderTestComponent();

    const textBox = screen.getByPlaceholderText(HTTPS_PROXY_PLACEHOLDER);
    await user.type(textBox, 'https://example.com');
    await user.click(screen.getByPlaceholderText(HTTP_PROXY_PLACEHOLDER));

    expect(
      screen.queryByText('The URL should include the scheme prefix (https://)', { exact: false }),
    ).not.toBeInTheDocument();
  });
});
