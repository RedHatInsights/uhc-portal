import React from 'react';
import { Formik } from 'formik';

import { render, screen, waitFor } from '~/testUtils';

import EditAWSTagsSection from './EditAWSTagsSection';

const MockFormikWrapper = ({
  children,
  initialValues = { labels: [{ key: '', value: '' }], awsTags: [{ key: '', value: '' }] },
}: {
  children: React.ReactNode;
  initialValues?: any;
}) => (
  <Formik initialValues={initialValues} onSubmit={() => {}}>
    {children}
  </Formik>
);

describe('<EditAWSTagsSection>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality ', () => {
    it('renders AWS tags section with basic fields', () => {
      render(
        <MockFormikWrapper>
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );

      expect(screen.getByText('AWS tags')).toBeInTheDocument();
      expect(
        screen.getByText(/only apply to the AWS resources created for this machine pool/),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add AWS tag' })).toBeEnabled();

      expect(screen.getByLabelText('Key')).not.toHaveAttribute('readonly');
      expect(screen.getByLabelText('Value')).not.toHaveAttribute('readonly');
    });

    it('adds AWS tag rows after clicking button', async () => {
      const { user } = render(
        <MockFormikWrapper>
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );
      expect(screen.getAllByLabelText('Key')).toHaveLength(1);
      expect(screen.getAllByLabelText('Value')).toHaveLength(1);

      await user.click(screen.getByRole('button', { name: 'Add AWS tag' }));

      expect(screen.getAllByLabelText('Key')).toHaveLength(2);
      expect(screen.getAllByLabelText('Value')).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: 'Remove AWS tag' })[0]).toBeDisabled();

      await user.click(screen.getAllByRole('button', { name: 'Remove AWS tag' })[1]);
      expect(screen.getAllByLabelText('Key')).toHaveLength(1);
      expect(screen.getAllByLabelText('Value')).toHaveLength(1);
    });
  });

  it('shows the AWS tag value error when a key is entered without touching the value field', async () => {
    const { user } = render(
      <Formik
        initialValues={{ awsTags: [{ key: '', value: '' }] }}
        validate={(values) => {
          const awsTags = values.awsTags.map((tag: { key: string; value: string }) => {
            if (tag.key && !tag.value) {
              return { value: 'Required' };
            }
            return {};
          });
          return { awsTags };
        }}
        onSubmit={() => {}}
      >
        <EditAWSTagsSection />
      </Formik>,
    );

    await user.type(screen.getByLabelText('Key'), 'env');

    const valueInput = screen.getByLabelText('Value');
    expect(valueInput).toBeInvalid();
    expect(valueInput).toHaveAttribute('aria-errormessage', 'awsTags[0].value-helper');
    expect(valueInput).toHaveAttribute('aria-describedby', 'awsTags[0].value-helper');
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(document.getElementById('awsTags[0].value-helper')).toHaveTextContent('Required');
  });

  it('AWS tags are displayed but disabled with the given reason', () => {
    render(
      <MockFormikWrapper initialValues={{ awsTags: [{ key: 'testKey', value: 'testValue' }] }}>
        <EditAWSTagsSection isDisabled disabledReason="Editing AWS tags requires 4.20" />
      </MockFormikWrapper>,
    );

    const keyInput = screen.getByLabelText('Key');
    const valueInput = screen.getByLabelText('Value');
    expect(keyInput).toHaveAttribute('readonly');
    expect(keyInput).toHaveValue('testKey');

    expect(valueInput).toHaveAttribute('readonly');
    expect(valueInput).toHaveValue('testValue');

    expect(screen.getByText('Editing AWS tags requires 4.20')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove AWS tag' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add AWS tag' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('AWS tags are editable for an existing machine pool when not disabled', () => {
    render(
      <MockFormikWrapper initialValues={{ awsTags: [{ key: 'testKey', value: 'testValue' }] }}>
        <EditAWSTagsSection />
      </MockFormikWrapper>,
    );

    expect(screen.getByLabelText('Key')).not.toHaveAttribute('readonly');
    expect(screen.getByLabelText('Value')).not.toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Remove AWS tag' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Add AWS tag' })).toBeEnabled();
  });

  it('shows system tags as read-only labels, outside of the editable rows', () => {
    render(
      <MockFormikWrapper>
        <EditAWSTagsSection
          readOnlyTags={[{ key: 'red-hat-managed', value: 'true', reason: 'Managed by Red Hat' }]}
        />
      </MockFormikWrapper>,
    );

    expect(screen.getByText('Managed by Red Hat')).toBeInTheDocument();
    expect(
      screen.getByText('These tags are applied by Red Hat and cannot be edited or removed.'),
    ).toBeInTheDocument();
    expect(screen.getByText('red-hat-managed=true')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Key')).toHaveLength(1);
  });

  it('shows a read-only group without a note when its reason has no hint', () => {
    render(
      <MockFormikWrapper>
        <EditAWSTagsSection
          readOnlyTags={[{ key: 'team', value: 'payments', reason: 'Set by your organization' }]}
        />
      </MockFormikWrapper>,
    );

    expect(screen.getByText('Set by your organization')).toBeInTheDocument();
    expect(screen.getByText('team=payments')).toBeInTheDocument();
    expect(
      screen.queryByText('These tags are applied by Red Hat and cannot be edited or removed.'),
    ).not.toBeInTheDocument();
  });

  describe('inherited tags', () => {
    it('keeps the inherited tag explanation open for keys other than Escape', async () => {
      const { user } = render(
        <MockFormikWrapper
          initialValues={{
            awsTags: [{ key: 'team', value: 'payments', inheritedValue: 'payments' }],
          }}
        >
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );
      const message =
        'Inherited from the cluster. Change the value to override it for this machine pool.';

      await user.tab();
      await user.tab();
      expect(await screen.findByText(message)).toBeInTheDocument();

      await user.keyboard('{Shift}');
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('shows the inherited tag explanation when the info icon is focused', async () => {
      const { user } = render(
        <MockFormikWrapper
          initialValues={{
            awsTags: [{ key: 'team', value: 'payments', inheritedValue: 'payments' }],
          }}
        >
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );

      await user.tab();
      await user.tab();

      expect(screen.getByRole('button', { name: 'Inherited AWS tag information' })).toHaveFocus();
      expect(
        await screen.findByText(
          'Inherited from the cluster. Change the value to override it for this machine pool.',
        ),
      ).toBeInTheDocument();

      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(
          screen.queryByText(
            'Inherited from the cluster. Change the value to override it for this machine pool.',
          ),
        ).not.toBeInTheDocument(),
      );
    });

    const inheritedValues = {
      awsTags: [
        { key: 'team', value: 'payments', inheritedValue: 'payments' },
        { key: 'env', value: 'prod' },
      ],
    };

    it('shows inherited tags as rows with a read-only key and an editable value', async () => {
      const { user } = render(
        <MockFormikWrapper initialValues={inheritedValues}>
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );

      const [inheritedKey, userKey] = screen.getAllByLabelText('Key');
      const [inheritedValue] = screen.getAllByLabelText('Value');
      expect(inheritedKey).toHaveValue('team');
      expect(inheritedKey).toHaveAttribute('readonly');
      expect(userKey).not.toHaveAttribute('readonly');

      await user.clear(inheritedValue);
      await user.type(inheritedValue, 'billing');
      expect(inheritedValue).toHaveValue('billing');
    });

    it('explains the inherited tag on hover of the key field and hides it on leave', async () => {
      const { user } = render(
        <MockFormikWrapper initialValues={inheritedValues}>
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );
      const message =
        'Inherited from the cluster. Change the value to override it for this machine pool.';

      await user.hover(screen.getAllByLabelText('Key')[0]);
      expect(await screen.findByText(message)).toBeInTheDocument();

      await user.unhover(screen.getAllByLabelText('Key')[0]);
      await waitFor(() => expect(screen.queryByText(message)).not.toBeInTheDocument());
    });

    it('explains the inherited tag on hover of the info icon', async () => {
      const { user } = render(
        <MockFormikWrapper initialValues={inheritedValues}>
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );

      await user.hover(screen.getByRole('button', { name: 'Inherited AWS tag information' }));

      expect(
        await screen.findByText(
          'Inherited from the cluster. Change the value to override it for this machine pool.',
        ),
      ).toBeInTheDocument();
    });

    it('resets an overridden tag to the cluster value instead of removing it', async () => {
      const { user } = render(
        <MockFormikWrapper
          initialValues={{
            awsTags: [{ key: 'team', value: 'billing', inheritedValue: 'payments' }],
          }}
        >
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );

      expect(screen.getByLabelText('Key')).toHaveAttribute('readonly');
      await user.hover(screen.getByLabelText('Key'));
      expect(
        await screen.findByText(
          'Overrides the cluster value "payments". Remove the override to use the cluster value.',
        ),
      ).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: 'Remove AWS tag' });
      expect(removeButton).toBeEnabled();
      await user.click(removeButton);

      expect(screen.getByLabelText('Key')).toHaveValue('team');
      expect(screen.getByLabelText('Value')).toHaveValue('payments');
      expect(screen.getByRole('button', { name: 'Remove AWS tag' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('treats an inherited tag whose value was changed as overridden', async () => {
      const { user } = render(
        <MockFormikWrapper
          initialValues={{
            awsTags: [{ key: 'team', value: 'payments', inheritedValue: 'payments' }],
          }}
        >
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );

      await user.type(screen.getByLabelText('Value'), '-2');
      await user.click(screen.getByRole('button', { name: 'Remove AWS tag' }));

      expect(screen.getByLabelText('Value')).toHaveValue('payments');
    });

    it('does not allow removing an inherited tag', async () => {
      const { user } = render(
        <MockFormikWrapper initialValues={inheritedValues}>
          <EditAWSTagsSection />
        </MockFormikWrapper>,
      );

      const [inheritedRemove, userRemove] = screen.getAllByRole('button', {
        name: 'Remove AWS tag',
      });
      expect(inheritedRemove).toHaveAttribute('aria-disabled', 'true');
      expect(userRemove).toBeEnabled();

      await user.hover(inheritedRemove);
      expect(
        await screen.findByText(
          "Inherited tags can't be removed from a machine pool. Remove them from the cluster instead.",
        ),
      ).toBeInTheDocument();
    });
  });

  it('does not allow adding more tags when the max count is reached', () => {
    render(
      <MockFormikWrapper
        initialValues={{
          awsTags: [
            { key: 'a', value: '1' },
            { key: 'b', value: '2' },
          ],
        }}
      >
        <EditAWSTagsSection maxCount={2} />
      </MockFormikWrapper>,
    );

    expect(screen.getByRole('button', { name: 'Add AWS tag' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  // This test can be enabled once we have an accurate max number of tags
  // describe('Validating number of AWS tags', () => {
  //   beforeEach(() => {
  //     mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
  //   });

  //   it('Does not allow adding more tags when AWS tags limit is reached', async () => {
  //     const awsTags = Array.from({ length: AWS_TAG_MAX_COUNT }, (_, i) => ({
  //       key: `aws-tag-${i}`,
  //       value: `value-${i}`,
  //     }));
  //     const initialValues = {
  //       awsTags,
  //     };
  //     const { user } = render(
  //       <MockFormikWrapper initialValues={initialValues}>
  //         <EditAWSTagsSection />
  //       </MockFormikWrapper>,
  //     );

  //     // Verify there are the expected number of tags
  //     expect(screen.getAllByLabelText('Key')).toHaveLength(AWS_TAG_MAX_COUNT);

  //     expect(screen.getByRole('button', { name: 'Add AWS tag' })).toHaveAttribute(
  //       'aria-disabled',
  //       'true',
  //     );

  //     await user.click(screen.getAllByRole('button', { name: 'Remove AWS tag' })[1]);
  //     expect(screen.getAllByLabelText('Key')).toHaveLength(AWS_TAG_MAX_COUNT - 1);

  //     expect(screen.getByRole('button', { name: 'Add AWS tag' })).toBeEnabled();
  //   });

  //   it('Allow adding more tags when AWS tags limit is not reached', () => {
  //     const awsTags = Array.from({ length: AWS_TAG_MAX_COUNT - 1 }, (_, i) => ({
  //       key: `aws-tag-${i}`,
  //       value: `value-${i}`,
  //     }));
  //     const initialValues = {
  //       awsTags,
  //     };
  //     render(
  //       <MockFormikWrapper initialValues={initialValues}>
  //         <EditAWSTagsSection />
  //       </MockFormikWrapper>,
  //     );

  //     // Verify there are the expected number of tags
  //     expect(screen.getAllByLabelText('Key')).toHaveLength(AWS_TAG_MAX_COUNT - 1);

  //     expect(screen.getByRole('button', { name: 'Add AWS tag' })).toBeEnabled();
  //   });
  // });
});
