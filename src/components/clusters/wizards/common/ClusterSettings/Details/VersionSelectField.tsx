import React, { useCallback, useEffect, useState } from 'react';
import { useField } from 'formik';
import { useDispatch } from 'react-redux';

import { FormGroup, Spinner } from '@patternfly/react-core';

import { versionComparator } from '~/common/versionComparator';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import ErrorBox from '~/components/common/ErrorBox';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { FuzzySelect, FuzzySelectProps } from '~/components/common/FuzzySelect/FuzzySelect';
import { FuzzyEntryType } from '~/components/common/FuzzySelect/types';
import { useOCPLifeCycleStatusData } from '~/components/releases/hooks';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { clustersActions } from '~/redux/actions';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';
import { Version } from '~/types/clusters_mgmt.v1';

import { getVersionsData, hasUnstableVersionsCapability } from './versionSelectHelper';

const sortFn = (a: FuzzyEntryType, b: FuzzyEntryType) => versionComparator(b.label, a.label);
interface VersionSelectFieldProps {
  label: string;
  name: string;
  channelGroup: string;
  onChange: (version: Version) => void;
  key?: string;
  isDisabled?: boolean;
  isEUSChannelEnabled?: boolean;
  isYStreamChannelEnabled?: boolean;
}

export const VersionSelectField = ({
  name,
  label,
  channelGroup,
  isDisabled,
  onChange,
  key,
  isEUSChannelEnabled,
  isYStreamChannelEnabled,
}: VersionSelectFieldProps) => {
  const dispatch = useDispatch();
  const organization = useGlobalState((state) => state.userProfile.organization.details);

  const unstableOCPVersionsEnabled =
    useFeatureGate(UNSTABLE_CLUSTER_VERSIONS) && hasUnstableVersionsCapability(organization);

  const [input, { touched, error }] = useField(name);
  const { clusterVersions: getInstallableVersionsResponse } = useGlobalState(
    (state) => state.clusters,
  );

  const {
    values: {
      [FieldId.ClusterVersion]: selectedClusterVersion,
      [FieldId.BillingModel]: billingModel,
      [FieldId.GcpAuthType]: gcpAuthType,
    },
    setFieldValue,
  } = useFormState();
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [statusData] = useOCPLifeCycleStatusData();
  const statusVersions = statusData?.[0]?.versions;
  const supportVersionMap = statusVersions?.reduce((acc: Record<string, string>, version) => {
    acc[version.name] = version.type;
    return acc;
  }, {});

  const isMarketplaceGcp =
    billingModel === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp;
  const isWIF = gcpAuthType === GCPAuthType.WorkloadIdentityFederation;

  const getInstallableVersions = useCallback(
    () =>
      dispatch(
        clustersActions.getInstallableVersions({
          isMarketplaceGcp,
          isWIF,
          includeUnstableVersions: unstableOCPVersionsEnabled,
        }),
      ),

    [dispatch, isMarketplaceGcp, isWIF, unstableOCPVersionsEnabled],
  );

  useEffect(() => {
    if (getInstallableVersionsResponse.fulfilled) {
      if (
        getInstallableVersionsResponse.meta?.isMarketplaceGcp !== isMarketplaceGcp ||
        getInstallableVersionsResponse.meta?.isWIF !== isWIF
      ) {
        // parameters changed, reset version selection and re-fetch versions
        setFieldValue(name, null);
        getInstallableVersions();
      } else {
        setVersions(getInstallableVersionsResponse.versions);
      }
    } else if (getInstallableVersionsResponse.error) {
      // error, close dropdown
      setIsOpen(false);
    } else if (!getInstallableVersionsResponse.pending) {
      // First time.
      // Resetting version selection as it could be present even when no versions are available
      // inside the store
      setFieldValue(name, null);
      getInstallableVersions();
    }
  }, [
    getInstallableVersions,
    getInstallableVersionsResponse,
    isMarketplaceGcp,
    isWIF,
    name,
    setFieldValue,
  ]);

  useEffect(() => {
    if (versions.length && !selectedClusterVersion?.raw_id) {
      const versionIndex = versions.findIndex((version) => version.default === true);
      setFieldValue(name, versions[versionIndex !== -1 ? versionIndex : 0]);
    }
  }, [versions, selectedClusterVersion?.raw_id, name, setFieldValue]);

  const onToggle: FuzzySelectProps['onOpenChange'] = (isExpanded) => {
    setIsOpen(isExpanded);
    // In case of backend error, don't want infinite loop reloading,
    // but allow manual reload by opening the dropdown.
    if (isExpanded && getInstallableVersionsResponse.error) {
      getInstallableVersions();
    }
  };

  const onSelect: FuzzySelectProps['onSelect'] = (_event, newVersionId) => {
    setIsOpen(false);
    const selectedVersion = versions.find((version) => version.id === newVersionId);
    setFieldValue(name, selectedVersion);
    if (selectedVersion) {
      onChange(selectedVersion);
    }
  };

  const versionsData = React.useMemo(
    () =>
      getVersionsData(
        versions,
        unstableOCPVersionsEnabled,
        supportVersionMap,
        isEUSChannelEnabled && !isYStreamChannelEnabled ? channelGroup : undefined,
      ),
    [
      supportVersionMap,
      versions,
      unstableOCPVersionsEnabled,
      channelGroup,
      isEUSChannelEnabled,
      isYStreamChannelEnabled,
    ],
  );

  return (
    <FormGroup {...input} label={label} fieldId={name} key={key} isRequired>
      {getInstallableVersionsResponse.error && (
        <ErrorBox
          message="Error getting cluster versions"
          response={getInstallableVersionsResponse}
        />
      )}

      {getInstallableVersionsResponse.pending && (
        <>
          <div className="spinner-fit-container">
            <Spinner size="lg" aria-label="Loading..." />
          </div>
          <div className="spinner-loading-text">Loading...</div>
        </>
      )}

      {getInstallableVersionsResponse.fulfilled && (
        <FuzzySelect
          aria-label={label}
          isOpen={isOpen}
          onOpenChange={onToggle}
          onSelect={onSelect}
          fuzziness={0}
          selectedEntryId={selectedClusterVersion?.id}
          selectionData={versionsData}
          isDisabled={isDisabled}
          sortFn={sortFn}
          placeholderText="Filter by versions"
          filterValidate={{
            pattern: /^[0-9.]*$/gm,
            message: 'Please enter only digits or periods.',
          }}
          truncation={100}
          inlineFilterPlaceholderText="Filter by version number"
          toggleId="version-selector"
          isScrollable
        />
      )}

      <FormGroupHelperText touched={touched} error={error} />
    </FormGroup>
  );
};
