import * as React from 'react';
import { Formik, FormikValues } from 'formik';

import links from '~/common/installLinks.mjs';
import { render, screen } from '~/testUtils';

import { WindowsLicenseIncludedField } from '../WindowsLicenseIncludedField';

import {
  initialValues,
  initialValuesEmptyMachineType,
  initialValuesWithWindowsLIEnabledMachineTypeSelected,
  WindowsLIDisabledMachinePool,
  WindowsLIEnabledMachinePool,
} from './WindowsLicenseIncludedField.fixtures';

const {
  WINDOWS_LICENSE_INCLUDED_AWS_DOCS: AWS_DOCS_LINK,
  WINDOWS_LICENSE_INCLUDED_REDHAT_DOCS: REDHAT_DOCS_LINK,
} = links;

// Formik Wrapper:
const buildTestComponent = (
  initialValues: FormikValues,
  children: React.ReactNode,
  onSubmit: () => void = jest.fn(),
  formValues = {},
) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...formValues,
    }}
    onSubmit={onSubmit}
  >
    {children}
  </Formik>
);

describe('<WindowsLicenseIncludedField />', () => {
  describe('When creating a new Machine Pool', () => {
    describe('When selected Machine Type is Windows LI compatible', () => {
      it('Shows the checkbox text', async () => {
        // Arrange
        render(
          buildTestComponent(
            { initialValuesWithWindowsLIEnabledMachineTypeSelected },
            <WindowsLicenseIncludedField />,
          ),
        );

        // Act
        // Assert
        expect(
          screen.getByText('Enable machine pool for Windows License Included'),
        ).toBeInTheDocument();

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
      });
    });

    it('Shows a PopoverHint for Machine Pools which are Windows LI enabled and verifies its functionality', async () => {
      // Arrange
      const { user } = render(
        buildTestComponent(
          { initialValuesWithWindowsLIEnabledMachineTypeSelected },
          <WindowsLicenseIncludedField />,
        ),
      );

      // Act
      const popoverHint = screen.getByLabelText('More information');
      await user.click(popoverHint);

      // Assert
      expect(screen.getByText(/Learn more about/i)).toBeInTheDocument();

      const awsDocsLink = screen.getByText('Microsoft licensing on AWS');
      const redhatDocsLink = screen.getByText('how to work with AWS-Windows-LI hosts');
      expect(awsDocsLink).toBeInTheDocument();
      expect(redhatDocsLink).toBeInTheDocument();
      expect(awsDocsLink).toHaveAttribute('href', AWS_DOCS_LINK);
      expect(redhatDocsLink).toHaveAttribute('href', REDHAT_DOCS_LINK);

      expect(
        screen.getByText(
          'When enabled, the machine pool is AWS License Included for Windows with associated fees.',
        ),
      ).toBeInTheDocument();
    });

    it('Shows a disabled checkbox with a related tooltip for Machine Types which are NOT Windows LI compatible', async () => {
      // Arrange
      const { user } = render(
        buildTestComponent({ initialValues }, <WindowsLicenseIncludedField />),
      );

      // Act
      // Assert
      const checkbox = screen.getByText('Enable machine pool for Windows License Included');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.parentNode).toHaveClass('pf-m-disabled');

      await user.hover(checkbox);
      expect(
        screen.getByText(
          'This instance type is not Windows License Included compatible, please see documentation for further details',
        ),
      ).toBeInTheDocument();
    });

    it('Shows a disabled checkbox with a related tooltip for an undefined selected Machine Type', async () => {
      // Arrange
      const { user } = render(
        buildTestComponent({ initialValuesEmptyMachineType }, <WindowsLicenseIncludedField />),
      );

      // Act
      // Assert
      const checkbox = screen.getByText('Enable machine pool for Windows License Included');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.parentNode).toHaveClass('pf-m-disabled');

      await user.hover(checkbox);
      expect(
        screen.getByText(
          'This instance type is not Windows License Included compatible, please see documentation for further details',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('When editing an existing Machine Pool', () => {
    describe('When the Machine Pool is Windows LI enabled', () => {
      it('Shows a comment specifying that the Machine Pool is Windows LI enabled', () => {
        // Arrange
        render(
          buildTestComponent(
            {},
            <WindowsLicenseIncludedField isEdit currentMP={WindowsLIEnabledMachinePool} />,
          ),
        );

        // Assert
        expect(screen.getByText('This machine pool is Windows LI enabled')).toBeInTheDocument();
      });

      it('Shows a PopoverHint and verifies its functionality', async () => {
        // Arrange
        const { user } = render(
          buildTestComponent(
            {},
            <WindowsLicenseIncludedField isEdit currentMP={WindowsLIEnabledMachinePool} />,
          ),
        );

        // Act
        const popoverHint = screen.getByLabelText('More information');
        await user.click(popoverHint);

        // Assert
        expect(screen.getByText(/Learn more about/i)).toBeInTheDocument();

        const awsDocsLink = screen.getByText('Microsoft licensing on AWS');
        const redhatDocsLink = screen.getByText('how to work with AWS-Windows-LI hosts');
        expect(awsDocsLink).toBeInTheDocument();
        expect(redhatDocsLink).toBeInTheDocument();
        expect(awsDocsLink).toHaveAttribute('href', AWS_DOCS_LINK);
        expect(redhatDocsLink).toHaveAttribute('href', REDHAT_DOCS_LINK);

        expect(
          screen.getByText(
            'When enabled, the machine pool is AWS License Included for Windows with associated fees.',
          ),
        ).toBeInTheDocument();
      });
    });

    it('When the Machine Pool has not enabled Windows LI, the comment nor the PopoverHint are not visible', () => {
      // Arrange
      render(
        buildTestComponent(
          {},
          <WindowsLicenseIncludedField isEdit currentMP={WindowsLIDisabledMachinePool} />,
        ),
      );

      // Act
      // Assert
      expect(
        screen.queryByText('This machine pool is Windows LI enabled.'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('More information')).not.toBeInTheDocument();
    });
  });
});
