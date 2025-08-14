import * as React from 'react';
import { Formik, FormikValues } from 'formik';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { WINDOWS_LICENSE_INCLUDED } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';

import EditDetailsSection from '../EditDetailsSection';

import {
  editDetailsSectionDefaultProps as defaultProps,
  mockHypershiftCluster,
} from './EditDetailsSection.fixtures';

jest.mock('~/components/clusters/common/clusterStates');
const mockIsHypershiftCluster = isHypershiftCluster as jest.Mock;

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

        it('Mentions the Machine Pool is Windows LI enabled for a selected Machine Pool which has enabled Windows LI', () => {
          mockIsHypershiftCluster.mockReturnValue(true);

          render(
            <FormikWrapper>
              <EditDetailsSection
                {...defaultProps}
                isEdit
                cluster={mockHypershiftCluster}
                currentMPId="windows-li-enabled-machine-pool"
              />
            </FormikWrapper>,
          );

          expect(screen.getByText('This machine pool is Windows LI enabled')).toBeInTheDocument();
        });

        it('Does not Mention the Machine Pool is Windows LI enabled for a selected Machine Pool which has not enabled Windows LI', () => {
          mockIsHypershiftCluster.mockReturnValue(true);

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

          expect(
            screen.queryByText('This machine pool is Windows LI enabled'),
          ).not.toBeInTheDocument();
        });
      });

      describe('when feature flag is disabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, false]]);
        });

        it('WindowsLicenseIncludedField text is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection {...defaultProps} isEdit cluster={mockHypershiftCluster} />
            </FormikWrapper>,
          );

          expect(
            screen.queryByText('Enable machine pool for Windows License Included'),
          ).not.toBeInTheDocument();
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

        it('WindowsLicenseIncludedField text is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection {...defaultProps} isEdit />
            </FormikWrapper>,
          );

          expect(
            screen.queryByText('Enable machine pool for Windows License Included'),
          ).not.toBeInTheDocument();
        });
      });

      describe('when feature flag is disabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, false]]);
        });

        it('WindowsLicenseIncludedField text is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection {...defaultProps} isEdit />
            </FormikWrapper>,
          );

          expect(
            screen.queryByText('Enable machine pool for Windows License Included'),
          ).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('when creating a new Machine Pool', () => {
    it('Machine Pool name TextField is visible', () => {
      render(
        <FormikWrapper>
          <EditDetailsSection {...defaultProps} isEdit={false} />
        </FormikWrapper>,
      );

      expect(screen.getByText('Machine pool name')).toBeInTheDocument();
    });

    describe('when Hypershift cluster', () => {
      beforeEach(() => {
        mockIsHypershiftCluster.mockReturnValue(true);
      });

      describe('when feature flag is enabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, true]]);
        });

        it('WindowsLicenseIncludedField text is visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection
                {...defaultProps}
                isEdit={false}
                cluster={mockHypershiftCluster}
              />
            </FormikWrapper>,
          );

          expect(
            screen.getByText('Enable machine pool for Windows License Included'),
          ).toBeInTheDocument();
        });
      });

      describe('when feature flag is disabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, false]]);
        });

        it('WindowsLicenseIncludedField text is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection
                {...defaultProps}
                isEdit={false}
                cluster={mockHypershiftCluster}
              />
            </FormikWrapper>,
          );

          expect(
            screen.queryByText('Enable machine pool for Windows License Included'),
          ).not.toBeInTheDocument();
        });
      });
    });

    describe('when non-hypershift cluster', () => {
      beforeEach(() => {
        mockIsHypershiftCluster.mockReturnValue(false);
      });

      // WindowsLicenseIncludedField is relevant only for Hypershift clusters
      describe('when feature flag is enabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, true]]);
        });

        it('WindowsLicenseIncludedField text is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection {...defaultProps} isEdit={false} />
            </FormikWrapper>,
          );

          expect(
            screen.queryByText('Enable machine pool for Windows License Included'),
          ).not.toBeInTheDocument();
        });
      });

      describe('when feature flag is disabled', () => {
        beforeEach(() => {
          mockUseFeatureGate([[WINDOWS_LICENSE_INCLUDED, false]]);
        });

        it('WindowsLicenseIncludedField text is not visible', () => {
          render(
            <FormikWrapper>
              <EditDetailsSection {...defaultProps} isEdit={false} />
            </FormikWrapper>,
          );

          expect(
            screen.queryByText('Enable machine pool for Windows License Included'),
          ).not.toBeInTheDocument();
        });
      });
    });
  });
});
