import * as React from 'react';
import { Formik, FormikValues } from 'formik';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { WINDOWS_LICENSE_INCLUDED } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import EditDetailsSection from '../EditDetailsSection';

import {
  editDetailsSectionDefaultProps as defaultProps,
  mockCluster,
  mockHypershiftCluster,
} from './EditDetailsSection.fixtures';

// Mock dependencies
jest.mock('~/components/clusters/common/clusterStates');
jest.mock('~/components/common/formik/TextField');
jest.mock('../../fields/InstanceTypeField');
jest.mock('../../fields/SelectField');
jest.mock('../../fields/SubnetField');
jest.mock('../../fields/WindowsLicenseIncludedField');

// Mock implementations
const mockIsHypershiftCluster = isHypershiftCluster as jest.Mock;
const mockTextField = jest.fn(() => <div>Machine pool name</div>);
const mockInstanceTypeField = jest.fn(() => <div>InstanceTypeField</div>);
const mockSubnetField = jest.fn(() => <div>SubnetField</div>);
const mockWindowsLicenseIncludedField = jest.fn(() => <div>WindowsLicenseIncludedField</div>);

// Apply mocks
require('~/components/common/formik/TextField').default = mockTextField;
require('../../fields/InstanceTypeField').default = mockInstanceTypeField;
require('../../fields/SubnetField').default = mockSubnetField;
require('../../fields/WindowsLicenseIncludedField').WindowsLicenseIncludedField =
  mockWindowsLicenseIncludedField;

// Formik wrapper for testing
const FormikWrapper = ({
  children,
  initialValues = {},
}: {
  children: React.ReactNode;
  initialValues?: FormikValues;
}) => (
  <Formik initialValues={initialValues} onSubmit={jest.fn()}>
    {children}
  </Formik>
);

describe('<EditDetailsSection />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when editing an existing Machine Pool', () => {
    describe('when Hypershift cluster', () => {
      beforeEach(() => {
        mockIsHypershiftCluster.mockReturnValue(true);
      });

      describe('when feature flag is enabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, true]]);
        });

        it('WindowsLicenseIncludedField is visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection
                {...defaultProps}
                isEdit
                cluster={mockHypershiftCluster}
                currentMPId="workers-1"
              />
            </FormikWrapper>,
          );

          expect(screen.getByText('WindowsLicenseIncludedField')).toBeInTheDocument();
        });
      });

      describe('when feature flag is disabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, false]]);
        });

        it('WindowsLicenseIncludedField is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection {...defaultProps} isEdit cluster={mockHypershiftCluster} />
            </FormikWrapper>,
          );

          expect(screen.queryByText('WindowsLicenseIncludedField')).not.toBeInTheDocument();
        });
      });
    });

    describe('when non-Hypershift cluster', () => {
      beforeEach(() => {
        mockIsHypershiftCluster.mockReturnValue(false);
      });

      // WINDOWS_LICENSE_INCLUDED feature flag is only relevant for Hypershift clusters
      describe('when feature flag is enabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, true]]);
        });

        it('WindowsLicenseIncludedField is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection {...defaultProps} isEdit cluster={mockHypershiftCluster} />
            </FormikWrapper>,
          );

          expect(screen.queryByText('WindowsLicenseIncludedField')).not.toBeInTheDocument();
        });
      });

      describe('when feature flag is disabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, false]]);
        });

        it('WindowsLicenseIncludedField is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection {...defaultProps} isEdit cluster={mockHypershiftCluster} />
            </FormikWrapper>,
          );

          expect(screen.queryByText('WindowsLicenseIncludedField')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('when creating a new Machine Pool', () => {
    it('machine pool TextField is visible', () => {
      render(
        <FormikWrapper>
          <EditDetailsSection {...defaultProps} isEdit={false} />
        </FormikWrapper>,
      );

      expect(screen.getByText('Machine pool name')).toBeInTheDocument();
    });

    it('InstanceTypeField is visible', () => {
      render(
        <FormikWrapper>
          <EditDetailsSection {...defaultProps} isEdit={false} cluster={mockHypershiftCluster} />
        </FormikWrapper>,
      );

      expect(screen.getByText('InstanceTypeField')).toBeInTheDocument();
    });

    describe('when Hypershift cluster', () => {
      beforeEach(() => {
        mockIsHypershiftCluster.mockReturnValue(true);
      });

      it('SubnetField is visible', () => {
        render(
          <FormikWrapper>
            <EditDetailsSection {...defaultProps} isEdit={false} cluster={mockHypershiftCluster} />
          </FormikWrapper>,
        );

        expect(screen.getByText('SubnetField')).toBeInTheDocument();
      });

      describe('when feature flag is enabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, true]]);
        });

        it('WindowsLicenseIncludedField is visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection
                {...defaultProps}
                isEdit={false}
                cluster={mockHypershiftCluster}
              />
            </FormikWrapper>,
          );

          expect(screen.getByText('WindowsLicenseIncludedField')).toBeInTheDocument();
        });
      });

      describe('when feature flag is disabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, false]]);
        });

        it('WindowsLicenseIncludedField is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection
                {...defaultProps}
                isEdit={false}
                cluster={mockHypershiftCluster}
              />
            </FormikWrapper>,
          );

          expect(screen.queryByText('WindowsLicenseIncludedField')).not.toBeInTheDocument();
        });
      });
    });

    describe('non-hypershift cluster', () => {
      beforeEach(() => {
        mockIsHypershiftCluster.mockReturnValue(false);
      });

      it('SubnetField is not visible', () => {
        render(
          <FormikWrapper>
            <EditDetailsSection {...defaultProps} isEdit={false} cluster={mockCluster} />
          </FormikWrapper>,
        );

        expect(screen.queryByLabelText('SubnetField')).not.toBeInTheDocument();
      });
    });

    // WINDOWS_LICENSE_INCLUDED feature flag is only relevant for Hypershift clusters
    describe('when feature flag is enabled', () => {
      beforeEach(() => {
        mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, true]]);
      });

      it('WindowsLicenseIncludedField is not visible', () => {
        render(
          <FormikWrapper>
            <EditDetailsSection {...defaultProps} isEdit={false} cluster={mockHypershiftCluster} />
          </FormikWrapper>,
        );

        expect(screen.queryByText('WindowsLicenseIncludedField')).not.toBeInTheDocument();
      });
    });

    describe('when feature flag is disabled', () => {
      beforeEach(() => {
        mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, false]]);
      });

      it('WindowsLicenseIncludedField is not visible', () => {
        render(
          <FormikWrapper>
            <EditDetailsSection {...defaultProps} isEdit={false} cluster={mockHypershiftCluster} />
          </FormikWrapper>,
        );

        expect(screen.queryByText('WindowsLicenseIncludedField')).not.toBeInTheDocument();
      });
    });
  });
});
