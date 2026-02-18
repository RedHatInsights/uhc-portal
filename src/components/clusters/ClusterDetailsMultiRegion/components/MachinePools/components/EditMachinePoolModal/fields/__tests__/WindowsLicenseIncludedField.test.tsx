import * as React from 'react';
import { Formik, FormikValues } from 'formik';

import links from '~/common/installLinks.mjs';
import { render, screen, waitFor } from '~/testUtils';

import { WindowsLicenseIncludedField } from '../WindowsLicenseIncludedField';

import {
  initialValues,
  initialValuesEmptyMachineType,
  initialValuesWithWindowsLIEnabledMachineTypeSelected,
  WindowsLIDisabledMachinePool,
  WindowsLIEnabledMachinePool,
} from './WindowsLicenseIncludedField.fixtures';

const minimumCompatibleVersion = '4.19.0';
const compatibleClusterVersion = minimumCompatibleVersion;
const nonCompatibleClusterVersion = '4.18.0';

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
    describe('When using a compatible version cluster', () => {
      it('Shows the checkbox text when selected Machine Type is Windows LI compatible', () => {
        // Arrange
        render(
          buildTestComponent(
            { ...initialValuesWithWindowsLIEnabledMachineTypeSelected },
            <WindowsLicenseIncludedField clusterVersion={compatibleClusterVersion} />,
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

      it('Shows a PopoverHint', async () => {
        // Arrange
        const { user } = render(
          buildTestComponent(
            { ...initialValuesWithWindowsLIEnabledMachineTypeSelected },
            <WindowsLicenseIncludedField clusterVersion={compatibleClusterVersion} />,
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
      });

      it('Shows a disabled checkbox for Machine Types which are NOT Windows LI compatible', async () => {
        // Arrange
        render(
          buildTestComponent(
            { ...initialValues },
            <WindowsLicenseIncludedField clusterVersion={compatibleClusterVersion} />,
          ),
        );

        // Act
        // Assert
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeDisabled();
      });

      it('Shows a related tooltip when hovering over the checkbox for Machine Types which are NOT Windows LI compatible', async () => {
        // Arrange
        const { user } = render(
          buildTestComponent(
            { ...initialValues },
            <WindowsLicenseIncludedField clusterVersion={compatibleClusterVersion} />,
          ),
        );

        // Act
        const checkbox = screen.getByRole('checkbox');
        await user.hover(checkbox);

        // Assert
        expect(
          screen.getByText('This instance type is not Windows License Included compatible.'),
        ).toBeInTheDocument();
      });

      it('Shows a disabled checkbox for an undefined selected Machine Type', async () => {
        // Arrange
        render(
          buildTestComponent(
            { ...initialValuesEmptyMachineType },
            <WindowsLicenseIncludedField clusterVersion={compatibleClusterVersion} />,
          ),
        );

        // Act
        // Assert
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeDisabled();
      });

      it('Shows a related tooltip when hovering over the checkbox for an undefined selected Machine Type', async () => {
        // Arrange
        const { user } = render(
          buildTestComponent(
            { ...initialValuesEmptyMachineType },
            <WindowsLicenseIncludedField clusterVersion={compatibleClusterVersion} />,
          ),
        );

        // Act
        const checkbox = screen.getByRole('checkbox');
        await user.hover(checkbox);

        // Assert
        expect(
          screen.getByText('This instance type is not Windows License Included compatible.'),
        ).toBeInTheDocument();
      });
    });

    describe('When using a non-compatible version cluster', () => {
      it('Shows a disabled checkbox', async () => {
        // Arrange
        render(
          buildTestComponent(
            { ...initialValuesWithWindowsLIEnabledMachineTypeSelected },
            <WindowsLicenseIncludedField clusterVersion={nonCompatibleClusterVersion} />,
          ),
        );

        // Act
        // Assert
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeDisabled();
      });

      it('Shows a related tooltip', async () => {
        // Arrange
        const { user } = render(
          buildTestComponent(
            { ...initialValuesWithWindowsLIEnabledMachineTypeSelected },
            <WindowsLicenseIncludedField clusterVersion={nonCompatibleClusterVersion} />,
          ),
        );

        // Act
        const checkbox = screen.getByRole('checkbox');
        await user.hover(checkbox);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(
              `Windows License Included enabled machine pools require control plane version ${minimumCompatibleVersion} or above.`,
            ),
          ).toBeVisible();
        });

        // instance type tooltip does not override it when both incompatibilities apply
        expect(
          screen.queryByText('This instance type is not Windows License Included compatible.'),
        ).not.toBeInTheDocument();
      });

      it('Shows a disabled checkbox when the selected Machine Type is NOT Windows LI compatible', async () => {
        // Arrange
        render(
          buildTestComponent(
            { ...initialValues },
            <WindowsLicenseIncludedField clusterVersion={nonCompatibleClusterVersion} />,
          ),
        );

        // Act
        // Assert
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeDisabled();
      });

      it('Shows a tooltip related to version non-compatibility even if the selected Machine Type is NOT Windows LI compatible', async () => {
        // Arrange
        const { user } = render(
          buildTestComponent(
            { ...initialValues },
            <WindowsLicenseIncludedField clusterVersion={nonCompatibleClusterVersion} />,
          ),
        );

        // Act
        const checkbox = screen.getByRole('checkbox');
        await user.hover(checkbox);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(
              `Windows License Included enabled machine pools require control plane version ${minimumCompatibleVersion} or above.`,
            ),
          ).toBeVisible();
        });
      });
    });

    // This case is not feasible in real life since we are talking about a ready cluster, so it must have a defined version
    describe('When cluster version is not available', () => {
      it('disables the checkbox when the selected instance type is incompatible', async () => {
        // Arrange
        render(
          buildTestComponent(
            { ...initialValues },
            <WindowsLicenseIncludedField clusterVersion="" />,
          ),
        );

        // Act
        // Assert
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeDisabled();
      });

      it('shows the version incompatibility tooltip when the selected instance type is incompatible', async () => {
        // Arrange
        const { user } = render(
          buildTestComponent(
            { ...initialValues },
            <WindowsLicenseIncludedField clusterVersion="" />,
          ),
        );

        // Act
        const checkbox = screen.getByRole('checkbox');
        await user.hover(checkbox);

        // Assert
        await waitFor(() => {
          expect(
            screen.getByText(
              `Windows License Included enabled machine pools require control plane version ${minimumCompatibleVersion} or above.`,
            ),
          ).toBeVisible();
        });

        // instance type tooltip does not override it when both incompatibilities apply
        expect(
          screen.queryByText('This instance type is not Windows License Included compatible.'),
        ).not.toBeInTheDocument();
      });
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

      it('Shows a PopoverHint', async () => {
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
