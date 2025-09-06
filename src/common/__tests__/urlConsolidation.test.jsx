import React from 'react';

import { render } from '~/testUtils';

import { getSupportCaseURL } from '../../components/clusters/ClusterDetailsMultiRegion/components/Support/components/SupportCasesCardHelper';
import ExternalLink from '../../components/common/ExternalLink';
import OfflineTokensAlert from '../../components/common/OfflineTokensAlert';
import { BANNED_USER_CODE, overrideErrorMessage } from '../errors';
import supportLinks from '../supportLinks.mjs';
import { getAllExternalLinks } from '../urlUtils.mjs';

describe('URL Consolidation', () => {
  describe('getAllExternalLinks utility', () => {
    it('should return a sorted array of unique URLs', async () => {
      // Get all URLs using the centralized function like our scripts do
      const allUrls = await getAllExternalLinks();

      // Should be an array
      expect(Array.isArray(allUrls)).toBe(true);

      // Should not be empty
      expect(allUrls.length).toBeGreaterThan(0);

      // Should be sorted
      const sortedUrls = [...allUrls].sort();
      expect(allUrls).toEqual(sortedUrls);

      // Should have no duplicates
      const uniqueUrls = [...new Set(allUrls)];
      expect(allUrls.length).toBe(uniqueUrls.length);
    });
  });

  describe('overrideErrorMessage function', () => {
    it('should return same message as before consolidation for BANNED_USER_CODE', () => {
      // Test the overrideErrorMessage function that was changed during consolidation
      const payload = { code: BANNED_USER_CODE };
      const result = overrideErrorMessage(payload);

      // This is what the message should be with the hardcoded URL (pre-consolidation)
      const expectedMessage = `Your account has been placed on Export Hold based on export control screening.
The Export Compliance Team has been notified that your account is on hold, and must conduct additional due diligence to resolve the Export Hold.
Try again in 24-48 hours.
Learn more: https://access.redhat.com/articles/1340183`;

      // Verify the function returns exactly the same message as before
      expect(result).toBe(expectedMessage);
    });
  });

  describe('OfflineTokensAlert component', () => {
    it('should render same URL as before consolidation for OFFLINE_TOKENS_KB', () => {
      // Test the OfflineTokensAlert component that was changed during consolidation
      const { container } = render(
        <OfflineTokensAlert isRosa={false} setShouldShowTokens={jest.fn()} />,
      );

      // Find the ExternalLink for the KB article (look for the external URL, not internal routing)
      const externalLink = container.querySelector('a[href*="access.redhat.com"]');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(externalLink).toHaveAttribute('href', 'https://access.redhat.com/articles/7074172');
    });
  });

  describe('TransferClusterOwnershipDialog component', () => {
    it('should render same URL as before consolidation for PULL_SECRET_CHANGE_KB', () => {
      // Test the ExternalLink component that's used in TransferClusterOwnershipDialog
      const { container } = render(
        <ExternalLink href={supportLinks.PULL_SECRET_CHANGE_KB}>
          Change the cluster&apos;s pull secret
        </ExternalLink>,
      );

      // Find the rendered link
      const externalLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(externalLink).toHaveAttribute('href', 'https://access.redhat.com/solutions/4902871');
    });
  });

  describe('BillingModel component', () => {
    it('should render same URL as before consolidation for BILLING_MODEL_KB', () => {
      // Test the ExternalLink component that's used in BillingModel
      const { container } = render(
        <ExternalLink href={supportLinks.BILLING_MODEL_KB} noIcon noTarget>
          Try OpenShift Dedicated
        </ExternalLink>,
      );

      // Find the rendered link
      const externalLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(externalLink).toHaveAttribute('href', 'https://access.redhat.com/articles/5990101');
    });
  });

  describe('ArchiveClusterDialog component', () => {
    it('should render same URL as before consolidation for ARCHIVE_CLUSTER_KB', () => {
      // Test the plain <a> tag that's used in ArchiveClusterDialog
      const { container } = render(
        <a href={supportLinks.ARCHIVE_CLUSTER_KB} target="_blank" rel="noreferrer noopener">
          Instructions
        </a>,
      );

      // Find the rendered link
      const archiveLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(archiveLink).toHaveAttribute('href', 'https://access.redhat.com/articles/4397891');
    });
  });

  describe('SupportStatus component', () => {
    it('should render same URL as before consolidation for OPENSHIFT_SUPPORT_POLICY', () => {
      // Test the ExternalLink component that's used in SupportStatus
      const { container } = render(
        <ExternalLink href={supportLinks.OPENSHIFT_SUPPORT_POLICY} noIcon>
          this resource
        </ExternalLink>,
      );

      // Find the rendered link
      const supportLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(supportLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/support/policy/updates/openshift',
      );
    });
  });

  describe('UpgradeSettingsFields component', () => {
    it('should render same URL as before consolidation for SECURITY_CLASSIFICATION_CRITICAL', () => {
      // Test the ExternalLink component that's used in UpgradeSettingsFields
      const { container } = render(
        <ExternalLink href={supportLinks.SECURITY_CLASSIFICATION_CRITICAL}>
          Critical security concerns
        </ExternalLink>,
      );

      // Find the rendered link
      const securityLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(securityLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/security/updates/classification/#critical',
      );
    });
  });

  describe('ClusterStatusMonitor component', () => {
    it('should render same URL as before consolidation for SUPPORT_CASE_NEW', () => {
      // Test the ExternalLink component that's used in ClusterStatusMonitor
      const { container } = render(
        <ExternalLink href={supportLinks.SUPPORT_CASE_NEW} noIcon>
          Contact support
        </ExternalLink>,
      );

      // Find the rendered link
      const supportCaseLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(supportCaseLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/support/cases/#/case/new',
      );
    });
  });

  describe('ClusterListTable component', () => {
    it('should render same URL as before consolidation for SUPPORT_CASE_NEW', () => {
      // Test the plain anchor tag that's used in ClusterListTable
      const { container } = render(
        <a href={supportLinks.SUPPORT_CASE_NEW} target="_blank" rel="noopener noreferrer">
          Contact Red Hat Support
        </a>,
      );

      // Find the rendered link
      const supportCaseLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(supportCaseLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/support/cases/#/case/new',
      );
    });
  });

  describe('ClusterCreatedIndicator component', () => {
    it('should render same URL as before consolidation for OPENSHIFT_POLICY_UPDATES', () => {
      // Test the ExternalLink component that's used in ClusterCreatedIndicator
      const { container } = render(
        <ExternalLink href={supportLinks.OPENSHIFT_POLICY_UPDATES} noIcon>
          supported
        </ExternalLink>,
      );

      // Find the rendered link
      const policyLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(policyLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/support/policy/updates/openshift/policies',
      );
    });
  });

  describe('ExpirationAlert component', () => {
    it('should render same URL as before consolidation for SUPPORT_HOME', () => {
      // Test the ExternalLink component that's used in ExpirationAlert
      const { container } = render(
        <ExternalLink href={supportLinks.SUPPORT_HOME}>Contact our customer support</ExternalLink>,
      );

      // Find the rendered link
      const supportHomeLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(supportHomeLink).toHaveAttribute('href', 'https://access.redhat.com/support/');
    });
  });

  describe('TokenErrorAlert component', () => {
    it('should render same URL as before consolidation for SUPPORT_HOME', () => {
      // Test the ExternalLink component that's used in TokenErrorAlert
      const { container } = render(
        <ExternalLink href={supportLinks.SUPPORT_HOME}>contact our customer support</ExternalLink>,
      );

      // Find the rendered link
      const supportLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(supportLink).toHaveAttribute('href', 'https://access.redhat.com/support/');
    });
  });

  describe('SupportLevelLabel component', () => {
    it('should render same URL as before consolidation for SUPPORT_HOME', () => {
      // Test the ExternalLink component that's used in SupportLevelLabel
      const { container } = render(
        <ExternalLink href={supportLinks.SUPPORT_HOME}>
          Production Support Terms of Service
        </ExternalLink>,
      );

      // Find the rendered link
      const supportLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(supportLink).toHaveAttribute('href', 'https://access.redhat.com/support/');
    });
  });

  describe('ClusterUpdates component', () => {
    it('should render same URL as before consolidation for SECURITY_CLASSIFICATION_CRITICAL', () => {
      // Test the ExternalLink component that's used in ClusterUpdates
      const { container } = render(
        <ExternalLink href={supportLinks.SECURITY_CLASSIFICATION_CRITICAL}>
          Critical security concerns
        </ExternalLink>,
      );

      // Find the rendered link
      const securityLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(securityLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/security/updates/classification/#critical',
      );
    });
  });

  describe('SupportCasesCardHelper component', () => {
    it('should return same URL as before consolidation for getSupportCaseURL function', () => {
      // Test the getSupportCaseURL function that was changed during consolidation
      const product = 'OSD';
      const version = 'OpenShift Dedicated';
      const clusterUUID = '12345';

      const result = getSupportCaseURL(product, version, clusterUUID);

      // Verify it matches the exact URL format from before consolidation
      // For non-OCP products, version is URL encoded with productName
      expect(result).toBe(
        'https://access.redhat.com/support/cases/#/case/new/open-case/describe-issue?clusterId=12345&caseCreate=true&product=OpenShift%20Dedicated&version=OpenShift%20Dedicated',
      );
    });

    it('should return same URL as before consolidation for OCP product', () => {
      // Test with OCP product which has different version handling
      const product = 'OCP';
      const version = '4.12.0';
      const clusterUUID = 'abc123';

      const result = getSupportCaseURL(product, version, clusterUUID);

      // Verify it matches the exact URL format from before consolidation for OCP
      expect(result).toBe(
        'https://access.redhat.com/support/cases/#/case/new/open-case/describe-issue?clusterId=abc123&caseCreate=true&product=OpenShift%20Container%20Platform&version=4.12.0',
      );
    });
  });

  describe('UpgradeSettingsFields component (common)', () => {
    it('should render same URL as before consolidation for SECURITY_CLASSIFICATION_CRITICAL', () => {
      // Test the ExternalLink component that's used in UpgradeSettingsFields (common version)
      const { container } = render(
        <ExternalLink href={supportLinks.SECURITY_CLASSIFICATION_CRITICAL}>
          Critical security concerns
        </ExternalLink>,
      );

      // Find the rendered link
      const securityLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(securityLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/security/updates/classification/#critical',
      );
    });
  });

  describe('TransferClusterOwnershipInfo component', () => {
    it('should render same URL as before consolidation for PULL_SECRET_CHANGE_KB', () => {
      // Test the ExternalLink component that's used in TransferClusterOwnershipInfo
      const { container } = render(
        <ExternalLink href={supportLinks.PULL_SECRET_CHANGE_KB} data-testid="external-link">
          this knowledgebase article
        </ExternalLink>,
      );

      // Find the rendered link
      const kbLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(kbLink).toHaveAttribute('href', 'https://access.redhat.com/solutions/4902871');
    });
  });

  describe('AddOnsDrawerPrimaryButton component', () => {
    it('should render same URL as before consolidation for SUPPORT_CASE_NEW', () => {
      // Test the anchor tag that's used in AddOnsDrawerPrimaryButton
      const { container } = render(<a href={supportLinks.SUPPORT_CASE_NEW}>Contact support</a>);

      // Find the rendered link
      const supportButton = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(supportButton).toHaveAttribute(
        'href',
        'https://access.redhat.com/support/cases/#/case/new',
      );
    });
  });

  describe('AddOnsDrawerFailedBox component', () => {
    it('should render same URL as before consolidation for SUPPORT_CASE_NEW', () => {
      // Test the ExternalLink component that's used in AddOnsDrawerFailedBox
      const { container } = render(
        <ExternalLink noIcon href={supportLinks.SUPPORT_CASE_NEW}>
          Contact support
        </ExternalLink>,
      );

      // Find the rendered link
      const supportLink = container.querySelector('a');

      // Verify it matches the exact hardcoded URL from before consolidation
      expect(supportLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/support/cases/#/case/new',
      );
    });
  });
});
