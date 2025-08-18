import React from 'react';
import { Formik } from 'formik';

import { AWS_TAGS_NEW_MP } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import EditAWSTagsSection, { AWS_TAG_MAX_COUNT } from './EditAWSTagsSection';

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
    it('renders AWS Tags section with basic fields', () => {
      render(
        <MockFormikWrapper>
          <EditAWSTagsSection isNewMachinePool />
        </MockFormikWrapper>,
      );

      expect(screen.getByText('AWS Tags')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add AWS Tag' })).toBeEnabled();

      expect(screen.getByLabelText('Key')).not.toHaveAttribute('readonly');
      expect(screen.getByLabelText('Value')).not.toHaveAttribute('readonly');
    });

    it('adds AWS Tag rows after clicking button', async () => {
      const { user } = render(
        <MockFormikWrapper>
          <EditAWSTagsSection isNewMachinePool />
        </MockFormikWrapper>,
      );
      expect(screen.getAllByLabelText('Key')).toHaveLength(1);
      expect(screen.getAllByLabelText('Value')).toHaveLength(1);

      await user.click(screen.getByRole('button', { name: 'Add AWS Tag' }));

      expect(screen.getAllByLabelText('Key')).toHaveLength(2);
      expect(screen.getAllByLabelText('Value')).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: 'Remove AWS Tag' })[0]).toBeDisabled();

      await user.click(screen.getAllByRole('button', { name: 'Remove AWS Tag' })[1]);
      expect(screen.getAllByLabelText('Key')).toHaveLength(1);
      expect(screen.getAllByLabelText('Value')).toHaveLength(1);
    });
  });

  it('AWS Tags are displayed but disabled for existing machine pool', () => {
    render(
      <MockFormikWrapper initialValues={{ awsTags: [{ key: 'testKey', value: 'testValue' }] }}>
        <EditAWSTagsSection isNewMachinePool={false} />
      </MockFormikWrapper>,
    );

    const keyInput = screen.getByLabelText('Key');
    const valueInput = screen.getByLabelText('Value');
    expect(keyInput).toHaveAttribute('readonly');
    expect(keyInput).toHaveValue('testKey');

    expect(valueInput).toHaveAttribute('readonly');
    expect(valueInput).toHaveValue('testValue');

    expect(screen.getByRole('button', { name: 'Remove AWS Tag' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add AWS Tag' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  describe('Validating number of AWS Tags', () => {
    beforeEach(() => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
    });

    it('Does not allow adding more tags when AWS Tags limit is reached', async () => {
      const awsTags = Array.from({ length: AWS_TAG_MAX_COUNT }, (_, i) => ({
        key: `aws-tag-${i}`,
        value: `value-${i}`,
      }));
      const initialValues = {
        awsTags,
      };
      const { user } = render(
        <MockFormikWrapper initialValues={initialValues}>
          <EditAWSTagsSection isNewMachinePool />
        </MockFormikWrapper>,
      );

      // Verify there are the expected number of tags
      expect(screen.getAllByLabelText('Key')).toHaveLength(AWS_TAG_MAX_COUNT);

      expect(screen.getByRole('button', { name: 'Add AWS Tag' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );

      await user.click(screen.getAllByRole('button', { name: 'Remove AWS Tag' })[1]);
      expect(screen.getAllByLabelText('Key')).toHaveLength(AWS_TAG_MAX_COUNT - 1);

      expect(screen.getByRole('button', { name: 'Add AWS Tag' })).toBeEnabled();
    });

    it('Allow adding more tags when AWS Tags limit is not reached', () => {
      const awsTags = Array.from({ length: AWS_TAG_MAX_COUNT - 1 }, (_, i) => ({
        key: `aws-tag-${i}`,
        value: `value-${i}`,
      }));
      const initialValues = {
        awsTags,
      };
      render(
        <MockFormikWrapper initialValues={initialValues}>
          <EditAWSTagsSection isNewMachinePool />
        </MockFormikWrapper>,
      );

      // Verify there are the expected number of tags
      expect(screen.getAllByLabelText('Key')).toHaveLength(AWS_TAG_MAX_COUNT - 1);

      expect(screen.getByRole('button', { name: 'Add AWS Tag' })).toBeEnabled();
    });
  });
});
