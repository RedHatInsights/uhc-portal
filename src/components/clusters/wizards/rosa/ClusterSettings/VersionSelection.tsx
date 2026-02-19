import React, { useEffect, useState } from 'react';
import { useField } from 'formik';
import { useDispatch } from 'react-redux';
import semver from 'semver';

import { Button, FormGroup, Popover, SelectProps, Spinner, Switch } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import { isSupportedMinorVersion } from '~/common/helpers';
import { versionComparator } from '~/common/versionComparator';
import {
  channelGroups,
  getVersionsData,
  hasUnstableVersionsCapability,
} from '~/components/clusters/wizards/common/ClusterSettings/Details/versionSelectHelper';
import { MIN_MANAGED_POLICY_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';
import ErrorBox from '~/components/common/ErrorBox';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { FuzzySelect } from '~/components/common/FuzzySelect/FuzzySelect';
import { FuzzyEntryType } from '~/components/common/FuzzySelect/types';
import { useOCPLifeCycleStatusData } from '~/components/releases/hooks';
import { UNSTABLE_CLUSTER_VERSIONS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { clustersActions } from '~/redux/actions';
import { useGlobalState } from '~/redux/hooks';
import type { Version } from '~/types/clusters_mgmt.v1';

import { useFormState } from '../../hooks';
import { FieldId } from '../constants';

import RosaVersionErrorAlert from './RosaVersionErrorAlert';

type VersionSelectionProps = {
  label: string;
  onChange: (version?: Version) => void;
  isOpen?: boolean;
  channelGroup?: string;
  isEUSChannelEnabled?: boolean;
};

function VersionSelection({
  label,
  onChange,
  channelGroup,
  isEUSChannelEnabled,
}: VersionSelectionProps) {
  const [input, { touched, error }, { setValue }] = useField(FieldId.ClusterVersion);
  const {
    values: {
      [FieldId.ClusterVersion]: selectedClusterVersion,
      [FieldId.Hypershift]: isHypershift,
      [FieldId.RosaMaxOsVersion]: rosaMaxOSVersion,
      [FieldId.InstallerRoleArn]: installerRoleArn,
      [FieldId.SupportRoleArn]: supportRoleArn,
      [FieldId.WorkerRoleArn]: workerRoleArn,
    },
  } = useFormState();
  const isHypershiftSelected = isHypershift === 'true';
  const organization = useGlobalState((state) => state.userProfile.organization.details);
  const unstableOCPVersionsEnabled =
    useFeatureGate(UNSTABLE_CLUSTER_VERSIONS) && hasUnstableVersionsCapability(organization);

  const dispatch = useDispatch();
  const getInstallableVersionsResponse = useGlobalState((state) => state.clusters.clusterVersions);
  const getInstallableVersions = (isHCP: boolean) =>
    dispatch(
      clustersActions.getInstallableVersions({
        isRosa: true,
        isHCP,
        includeUnstableVersions: unstableOCPVersionsEnabled,
      }),
    );

  const awsAccountRoleArns = useGlobalState(
    (state) => state.rosaReducer.getAWSAccountRolesARNsResponse,
  );

  const hasManagedArnsSelected = (awsAccountRoleArns?.data || []).some(
    (roleGroup) =>
      (roleGroup.managedPolicies || roleGroup.hcpManagedPolicies) &&
      (roleGroup.Installer === installerRoleArn ||
        roleGroup.Support === supportRoleArn ||
        roleGroup.Worker === workerRoleArn),
  );

  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [rosaVersionError, setRosaVersionError] = useState(false);
  const [showOnlyCompatibleVersions, setShowOnlyCompatibleVersions] = useState(true);
  const [statusData] = useOCPLifeCycleStatusData();
  const statusVersions = statusData?.[0]?.versions || [];

  const supportVersionMap = Object.fromEntries(
    // version.name is 'major.minor' string e.g. '4.11'.
    statusVersions.map((version) => [version.name, version.type]),
  );

  const isValidRosaVersion = React.useCallback(
    (version: Version) =>
      version.rosa_enabled &&
      (isHypershiftSelected ||
        !rosaMaxOSVersion ||
        isSupportedMinorVersion(version?.raw_id || '', rosaMaxOSVersion)),
    [rosaMaxOSVersion, isHypershiftSelected], // rosaMaxOSVersion is actually the max version allowed by the chosen AccountRoles
  );

  const toggleCompatibleVersions = (
    ev: React.FormEvent<HTMLInputElement>,
    showCompatible: boolean,
  ) => {
    ev.preventDefault();
    ev.stopPropagation();
    setShowOnlyCompatibleVersions(showCompatible);
  };

  const isHostedDisabled = React.useCallback(
    (version: Version) => isHypershiftSelected && !version.hosted_control_plane_enabled,
    [isHypershiftSelected],
  );

  const incompatibleVersionReason = React.useCallback(
    (version: Version): string | undefined => {
      if (!version?.raw_id) {
        return undefined;
      }

      if (isHostedDisabled(version)) {
        return 'This version is not compatible with a Hosted control plane';
      }

      const isIncompatibleManagedVersion =
        hasManagedArnsSelected && semver.lt(version.raw_id, MIN_MANAGED_POLICY_VERSION);

      if (!isValidRosaVersion(version) || isIncompatibleManagedVersion) {
        return 'This version is not compatible with the selected ARNs in previous step';
      }
      return undefined;
    },
    [hasManagedArnsSelected, isHostedDisabled, isValidRosaVersion],
  );

  useEffect(() => {
    // Get version list if first time or if control plane selection has changed
    const isHCPVersions = getInstallableVersionsResponse.params?.product === 'hcp';

    if (
      !getInstallableVersionsResponse.fulfilled ||
      getInstallableVersionsResponse.error ||
      (isHCPVersions && !isHypershiftSelected) ||
      (!isHCPVersions && isHypershiftSelected)
    ) {
      getInstallableVersions(isHypershiftSelected);
    }
    // Call only component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => {
      if (getInstallableVersionsResponse.fulfilled) {
        const versions = getInstallableVersionsResponse?.versions ?? [];

        const selectedVersionInVersionList = versions.find(
          (ver: Version) => ver.id === selectedClusterVersion?.id,
        );

        if (
          selectedClusterVersion?.id &&
          (!selectedVersionInVersionList || incompatibleVersionReason(selectedVersionInVersionList))
        ) {
          // The previously selected version is no longer compatible
          setValue(undefined);
          onChange(undefined);
        }
        setVersions(versions);
      } else if (getInstallableVersionsResponse.error) {
        // error, close dropdown
        setIsOpen(false);
      }
    },
    // We only want to run this code when the full set of available versions is available.
    // and not when selectedClusterVersion? changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getInstallableVersionsResponse],
  );

  useEffect(() => {
    if (versions.length && !selectedClusterVersion?.id) {
      const targetChannelGroup =
        isEUSChannelEnabled && channelGroup ? channelGroup : channelGroups.STABLE;

      const defaultVersion = versions.find((version) => version.default === true);

      const defaultRosaVersion = versions.find(
        (version) => isValidRosaVersion(version) && version.channel_group === targetChannelGroup,
      );

      const defaultHypershiftVersion =
        isHypershiftSelected &&
        versions.find(
          (version) =>
            version.hosted_control_plane_enabled && version.channel_group === targetChannelGroup,
        );

      if (!defaultRosaVersion || (isHypershiftSelected && !defaultHypershiftVersion)) {
        setRosaVersionError(true);
        return;
      }

      setRosaVersionError(false);

      // default to max: hypershift version supported (if hypershift), rosa version supported, version.default, or first version in list
      const version =
        defaultHypershiftVersion || defaultRosaVersion || defaultVersion || versions[0];

      setValue(version);
      onChange(version);
    }
  }, [
    versions,
    selectedClusterVersion?.id,
    rosaMaxOSVersion,
    setValue,
    onChange,
    isHypershiftSelected,
    isValidRosaVersion,
    isEUSChannelEnabled,
    channelGroup,
  ]);

  const onSelect: SelectProps['onSelect'] = (_event, selection) => {
    setIsOpen(false);
    const selectedVersion = versions.find((version) => version.id === selection);
    setValue(selectedVersion);
    onChange(selectedVersion);
  };

  const getSelection = () => {
    const selectedVersion = versions.find((version) => input.value?.id === version.id);
    return selectedVersion ? selectedVersion.id : '';
  };

  const { versionsData, hasIncompatibleVersions } = React.useMemo(() => {
    const hasIncompatible = versions.some((version) => incompatibleVersionReason(version));

    const filteredVersions = showOnlyCompatibleVersions
      ? versions.filter((version) => !incompatibleVersionReason(version))
      : versions;

    const groupedVersions = getVersionsData(
      filteredVersions,
      unstableOCPVersionsEnabled,
      supportVersionMap,
      channelGroup,
      isEUSChannelEnabled,
    );

    // If getVersionsData returns an array (specific channel selected), wrap it in an object
    const normalizedVersions = Array.isArray(groupedVersions)
      ? { Versions: groupedVersions }
      : groupedVersions;

    const processedGroups = Object.entries(normalizedVersions).reduce<
      Record<string, FuzzyEntryType[]>
    >((groups, [groupName, groupVersions]) => {
      const processedVersions = groupVersions.map((version: FuzzyEntryType) => {
        const originalVersion = versions.find((v) => v.id === version.entryId)!;
        const incompatibilityReason = incompatibleVersionReason(originalVersion);
        return {
          ...version,
          description: incompatibilityReason || version.description || '',
          disabled: !!incompatibilityReason,
        };
      });

      return {
        ...groups,
        [groupName]: processedVersions,
      };
    }, {});

    return {
      versionsData: processedGroups,
      hasIncompatibleVersions: hasIncompatible,
    };
  }, [
    versions,
    showOnlyCompatibleVersions,
    incompatibleVersionReason,
    unstableOCPVersionsEnabled,
    supportVersionMap,
    channelGroup,
    isEUSChannelEnabled,
  ]);

  const sortFn = (a: FuzzyEntryType, b: FuzzyEntryType) => versionComparator(b.label, a.label);

  const compatibleVersionsSwitchControl = hasIncompatibleVersions ? (
    <Switch
      className="pf-v6-u-mx-md pf-v6-u-mt-md pf-v6-u-font-size-sm"
      id="view-only-compatible-versions"
      aria-label="View only compatible versions"
      key={`compatible-switch-${showOnlyCompatibleVersions}`}
      label={
        <>
          <span>View only compatible versions</span>
          <Popover
            bodyContent={
              isHypershiftSelected
                ? 'View only versions that are compatible with a Hosted control plane'
                : 'View only versions that are compatible with the selected ARNs in previous step'
            }
            enableFlip={false}
          >
            <Button
              icon={<OutlinedQuestionCircleIcon />}
              variant="plain"
              className="pf-v6-u-p-0 pf-v6-u-ml-md"
            />
          </Popover>
        </>
      }
      hasCheckIcon
      isChecked={showOnlyCompatibleVersions}
      onChange={toggleCompatibleVersions}
    />
  ) : null;

  return (
    <FormGroup {...input} label={label} isRequired>
      {getInstallableVersionsResponse.error && (
        <ErrorBox
          message="Error getting cluster versions"
          response={getInstallableVersionsResponse}
        />
      )}
      {rosaVersionError ? (
        <RosaVersionErrorAlert isHypershiftSelected={isHypershiftSelected} />
      ) : null}
      {getInstallableVersionsResponse.pending && (
        <>
          <div className="spinner-fit-container">
            <Spinner size="lg" aria-label="Loading..." />
          </div>
          <div className="spinner-loading-text">Loading...</div>
        </>
      )}
      {getInstallableVersionsResponse.fulfilled && !rosaVersionError && (
        <FuzzySelect
          aria-label={label}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={onSelect}
          selectedEntryId={selectedClusterVersion?.id || getSelection()}
          fuzziness={0}
          selectionData={versionsData}
          sortFn={sortFn}
          placeholderText="Filter by versions"
          filterValidate={{
            pattern: /^[0-9.]*$/gm,
            message: 'Please enter only digits or periods.',
          }}
          truncation={100}
          inlineFilterPlaceholderText="Filter by version number"
          toggleId="version-selector"
          isDisabled={false}
          isScrollable
          includeDisabledInSearchResults
          additionalFilterControls={compatibleVersionsSwitchControl}
        />
      )}

      <FormGroupHelperText touched={touched} error={error} />
    </FormGroup>
  );
}

export default VersionSelection;
