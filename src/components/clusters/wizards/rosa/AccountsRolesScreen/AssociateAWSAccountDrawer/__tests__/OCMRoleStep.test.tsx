import React from 'react';
import { Formik } from 'formik';

import links from '~/common/installLinks.mjs';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { render, screen } from '~/testUtils';

import OCMRoleStep from '../OCMRoleStep';

const buildTestComponent = (formValues = {}) => (
  <Formik
    initialValues={{
      [FieldId.Hypershift]: 'true',
      ...formValues,
    }}
    onSubmit={jest.fn()}
  >
    <OCMRoleStep title="" />
  </Formik>
);

describe('<OCMRoleStep />', () => {
  it('AWS account association link is correct when hypershift is selected', async () => {
    const { user } = render(buildTestComponent());

    const moreInfoBtn = await screen.findByLabelText(
      'More information on Why do I need to link my account?',
    );
    await user.click(moreInfoBtn);

    const link = screen.getByText(
      'Review the AWS policy permissions for the basic and admin OCM roles.',
    );
    expect(link).toHaveAttribute('href', links.ROSA_AWS_ACCOUNT_ASSOCIATION);
  });

  it('AWS account association link is correct when classic is selected', async () => {
    const { user } = render(buildTestComponent({ [FieldId.Hypershift]: 'false' }));

    const moreInfoBtn = await screen.findByLabelText(
      'More information on Why do I need to link my account?',
    );
    await user.click(moreInfoBtn);

    const link = screen.getByText(
      'Review the AWS policy permissions for the basic and admin OCM roles.',
    );
    expect(link).toHaveAttribute('href', links.ROSA_CLASSIC_AWS_ACCOUNT_ASSOCIATION);
  });
});
