import React, { useCallback, useEffect, useState } from 'react';
import { Field } from 'formik';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import {
  Alert,
  Button,
  Content,
  ContentVariants,
  ExpandableSection,
  Grid,
  GridItem,
  Label,
  Spinner,
  Title,
} from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import { formatMinorVersion, isSupportedMinorVersion } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import { Link } from '~/common/routing';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { MIN_MANAGED_POLICY_VERSION } from '~/components/clusters/wizards/rosa/rosaConstants';
import ExternalLink from '~/components/common/ExternalLink';
import InstructionCommand from '~/components/common/InstructionCommand';
import { ReduxSelectDropdown } from '~/components/common/ReduxFormComponents_deprecated';
import ReduxVerticalFormGroup from '~/components/common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';
import { useOCPLatestVersion } from '~/components/releases/hooks';
import useAnalytics from '~/hooks/useAnalytics';
import { usePreviousProps } from '~/hooks/usePreviousProps';
import { HCP_USE_UNMANAGED } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { FieldId } from '../../constants';
import { RosaCliCommand } from '../constants/cliCommands';

import AWSAccountRolesError from './components/AWSAccountRolesError';

import '../AccountsRolesScreen.scss';

export const NO_ROLE_DETECTED = 'No role detected';

const hasNoTrustedRelationshipOnClusterRoleError = ({ errorDetails }) =>
  errorDetails?.some((error) => error?.Error_Key === 'NoTrustedRelationshipOnClusterRole');

const hasCompleteRoleSet = (role, isHypershiftSelected) =>
  role.Installer && role.Support && role.Worker && (role.ControlPlane || isHypershiftSelected);

// Order: current selected role > 'ManagedOpenShift'-prefixed role > first managed policy role > first complete role set > first incomplete role set > 'No Role Detected'
export const getDefaultInstallerRole = (
  selectedInstallerRoleARN,
  accountRolesARNs,
  isHypershiftSelected,
) => {
  const isSelectedRoleValid = accountRolesARNs.some(
    (role) => role.Installer === selectedInstallerRoleARN,
  );
  if (
    selectedInstallerRoleARN &&
    selectedInstallerRoleARN !== NO_ROLE_DETECTED &&
    isSelectedRoleValid
  ) {
    return selectedInstallerRoleARN;
  }

  if (accountRolesARNs.length === 0) {
    return NO_ROLE_DETECTED;
  }

  const firstCompleteManagedPolicyRole = accountRolesARNs.find(
    (role) =>
      (role.managedPolicies || role.hcpManagedPolicies) &&
      hasCompleteRoleSet(role, isHypershiftSelected),
  );

  const firstManagedOpenshiftPrefix = accountRolesARNs.find(
    (role) => role.prefix === 'ManagedOpenShift',
  );

  const firstCompleteManagedOpenshiftPrefix = accountRolesARNs.find(
    (role) => role.prefix === 'ManagedOpenShift' && hasCompleteRoleSet(role, isHypershiftSelected),
  );

  const firstCompleteRoleSet = accountRolesARNs.find((role) =>
    hasCompleteRoleSet(role, isHypershiftSelected),
  );

  const defaultRole =
    firstCompleteManagedOpenshiftPrefix ||
    firstCompleteManagedPolicyRole ||
    firstCompleteRoleSet ||
    (!firstCompleteRoleSet && firstManagedOpenshiftPrefix) ||
    accountRolesARNs[0];

  return defaultRole.Installer;
};
function AccountRolesARNsSection({
  selectedAWSAccountID,
  selectedInstallerRoleARN,
  rosaMaxOSVersion,
  getAWSAccountRolesARNs,
  getAWSAccountRolesARNsResponse,
  clearGetAWSAccountRolesARNsResponse,
  isHypershiftSelected,
  onAccountChanged,
}) {
  const { setFieldValue, getFieldProps, getFieldMeta, setFieldTouched, validateForm } =
    useFormState();
  const track = useAnalytics();
  const [isExpanded, setIsExpanded] = useState(true);
  const [accountRoles, setAccountRoles] = useState([]);
  const [installerRoleOptions, setInstallerRoleOptions] = useState([]);
  const [selectedInstallerRole, setSelectedInstallerRole] = useState(NO_ROLE_DETECTED);
  const [showMissingArnsError, setShowMissingArnsError] = useState(false);
  const [hasFinishedLoadingRoles, setHasFinishedLoadingRoles] = useState(false);
  const [hasManagedPolicies, setHasManagedPolicies] = useState(false);
  const useHCPManagedAndUnmanaged = useFeatureGate(HCP_USE_UNMANAGED);
  const isMissingOCMRole = hasNoTrustedRelationshipOnClusterRoleError(
    getAWSAccountRolesARNsResponse,
  );

  const prevSelected = usePreviousProps(selectedAWSAccountID);

  useEffect(() => {
    // this is required to show any validation error messages for the 4 disabled ARNs fields
    setFieldTouched(FieldId.InstallerRoleArn, true, false);
    setFieldTouched(FieldId.SupportRoleArn, true, false);
    setFieldTouched(FieldId.WorkerRoleArn, true, false);
    if (!isHypershiftSelected) {
      setFieldTouched(FieldId.ControlPlaneRoleArn, true, false);
    }
  }, [isHypershiftSelected, setFieldTouched]);

  const updateRoleArns = useCallback(
    (role) => {
      const promiseArr = [
        setFieldValue(FieldId.InstallerRoleArn, role?.Installer || NO_ROLE_DETECTED, false),
        setFieldValue(FieldId.SupportRoleArn, role?.Support || NO_ROLE_DETECTED, false),
        setFieldValue(FieldId.WorkerRoleArn, role?.Worker || NO_ROLE_DETECTED, false),
      ];
      if (!isHypershiftSelected) {
        promiseArr.push(
          setFieldValue(FieldId.ControlPlaneRoleArn, role?.ControlPlane || NO_ROLE_DETECTED, false),
        );
      }
      Promise.all(promiseArr).then(() => {
        setTimeout(() => {
          validateForm();
        }, 10);
      });
    },
    [isHypershiftSelected, setFieldValue, validateForm],
  );

  useEffect(() => {
    // Skips first render since prevSelected is undefined
    if (prevSelected && selectedAWSAccountID !== prevSelected) {
      updateRoleArns(null);
      setSelectedInstallerRole(NO_ROLE_DETECTED);
      setAccountRoles([]);
      setInstallerRoleOptions([]);
      setShowMissingArnsError(false);
      clearGetAWSAccountRolesARNsResponse();
      onAccountChanged();
    }
  }, [
    selectedAWSAccountID,
    prevSelected,
    clearGetAWSAccountRolesARNsResponse,
    onAccountChanged,
    updateRoleArns,
  ]);

  useEffect(() => {
    const selectedRole = accountRoles.find((role) => role.Installer === selectedInstallerRole);
    setShowMissingArnsError(
      !selectedRole || !hasCompleteRoleSet(selectedRole, isHypershiftSelected),
    );
  }, [selectedInstallerRole, accountRoles, isHypershiftSelected]);

  const hasManagedPoliciesByRole = useCallback(
    (role) => (isHypershiftSelected ? role.hcpManagedPolicies : role.managedPolicies),
    [isHypershiftSelected],
  );

  // Determine whether the current selected role has managed policies and set to state managed value
  useEffect(() => {
    const selectedRole = accountRoles.find((role) => role.Installer === selectedInstallerRole);

    if (getAWSAccountRolesARNsResponse.fulfilled && selectedRole) {
      setHasManagedPolicies(hasManagedPoliciesByRole(selectedRole));
    }
  }, [
    getAWSAccountRolesARNsResponse,
    selectedInstallerRole,
    hasManagedPoliciesByRole,
    accountRoles,
  ]);

  const setSelectedInstallerRoleAndOptions = useCallback(
    (accountRolesARNs) => {
      // Filter out ARN sets which do not have an Installer role, which is required and used as key for the dropdown.
      // Other roles, if undefined, will show up as 'No Role Detected' in their respective fields.
      const filteredRoles = accountRolesARNs.filter((role) => role.Installer);

      const installerOptions = filteredRoles.map((role) => ({
        name: role.Installer,
        value: role.Installer,
        ...(!isHypershiftSelected &&
          hasManagedPoliciesByRole(role) && {
            label: (
              <Label color="blue" isCompact>
                Recommended
              </Label>
            ),
          }),
      }));

      const defaultInstallerRole = getDefaultInstallerRole(
        selectedInstallerRoleARN,
        filteredRoles,
        isHypershiftSelected,
      );
      const defaultRole = filteredRoles.find((role) => role.Installer === defaultInstallerRole);

      if (installerOptions.length === 0) {
        updateRoleArns(null);
        setInstallerRoleOptions([]);
        setFieldValue(FieldId.RosaMaxOsVersion, undefined);
      } else {
        updateRoleArns(defaultRole);
        setInstallerRoleOptions(installerOptions);
        setFieldValue(FieldId.RosaMaxOsVersion, defaultRole.version, false);
      }
      setAccountRoles(filteredRoles);
      setHasFinishedLoadingRoles(true);

      setSelectedInstallerRole(defaultInstallerRole);
    },
    [
      isHypershiftSelected,
      hasManagedPoliciesByRole,
      selectedInstallerRoleARN,
      setFieldValue,
      updateRoleArns,
    ],
  );

  const trackArnsRefreshed = useCallback(
    (response) => {
      const alertErrorTitle = isMissingOCMRole
        ? 'Cannot detect an OCM role'
        : 'Error getting AWS account ARNs';
      track(trackEvents.ARNsRefreshed, {
        customProperties: {
          error: !!response.error,
          ...(response.error && {
            error_title: alertErrorTitle,
            error_message: response.errorMessage || undefined, // omit empty strings
            error_code: response.errorCode,
            error_operation_id: response.operationID,
          }),
        },
      });
    },
    [isMissingOCMRole, track],
  );

  useEffect(() => {
    if (
      !getAWSAccountRolesARNsResponse.pending &&
      !getAWSAccountRolesARNsResponse.fulfilled &&
      !getAWSAccountRolesARNsResponse.error
    ) {
      setHasFinishedLoadingRoles(false);
      setShowMissingArnsError(false);
      getAWSAccountRolesARNs(selectedAWSAccountID);
    } else if (getAWSAccountRolesARNsResponse.fulfilled) {
      const accountRolesARNs = get(getAWSAccountRolesARNsResponse, 'data', []).filter((arn) => {
        if (isHypershiftSelected && useHCPManagedAndUnmanaged) {
          return true;
        }
        return isHypershiftSelected
          ? arn.hcpManagedPolicies && arn.managedPolicies
          : !arn.hcpManagedPolicies && !arn.managedPolicies;
      });
      setSelectedInstallerRoleAndOptions(accountRolesARNs);
    } else if (getAWSAccountRolesARNsResponse.error) {
      setSelectedInstallerRoleAndOptions([]);
    }
  }, [
    selectedAWSAccountID,
    getAWSAccountRolesARNsResponse,
    getAWSAccountRolesARNs,
    isHypershiftSelected,
    useHCPManagedAndUnmanaged,
    setSelectedInstallerRoleAndOptions,
  ]);

  useEffect(() => {
    if (getAWSAccountRolesARNsResponse.fulfilled || getAWSAccountRolesARNsResponse.error) {
      trackArnsRefreshed(getAWSAccountRolesARNsResponse);
    }
  }, [getAWSAccountRolesARNsResponse, trackArnsRefreshed]);

  const onToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const onInstallerRoleChange = (_, value) => {
    // changing to a new set of ARNs, which could have different
    // rosa_max_os_version, so clear the cluster_version which
    // will get a new default on next step of the wizard
    setFieldValue(FieldId.ClusterVersion, undefined);
    const role = accountRoles.find((r) => r.Installer === value);
    updateRoleArns(role);
    setSelectedInstallerRole(value);
  };

  const roleARNRequired = (value) =>
    value && value !== NO_ROLE_DETECTED ? undefined : 'ARN field is required.';

  const refreshARNs = () => {
    clearGetAWSAccountRolesARNsResponse();
    getAWSAccountRolesARNs(selectedAWSAccountID);
    setHasFinishedLoadingRoles(false);
    setShowMissingArnsError(false);
  };

  const [latestOCPVersion, latestVersionLoaded] = useOCPLatestVersion('stable');
  const rolesOutOfDate =
    latestVersionLoaded && !isSupportedMinorVersion(latestOCPVersion, rosaMaxOSVersion);
  const hasStandaloneManagedRole = !isHypershiftSelected && hasManagedPolicies;

  const arnCompatibilityAlertTitle = React.useMemo(() => {
    if (isHypershiftSelected)
      return 'The selected account-wide roles are compatible with all OpenShift versions which support a hosted control plane.';
    if (hasStandaloneManagedRole)
      return `The selected account-wide roles are preferred and compatible with OpenShift version ${MIN_MANAGED_POLICY_VERSION} and newer.`;

    return `The selected account-wide roles are compatible with OpenShift version ${formatMinorVersion(
      rosaMaxOSVersion,
    )} and earlier.`;
  }, [hasStandaloneManagedRole, isHypershiftSelected, rosaMaxOSVersion]);

  const showAccountRolesError =
    getAWSAccountRolesARNsResponse.error || (showMissingArnsError && hasFinishedLoadingRoles);

  return (
    <>
      <GridItem />
      <GridItem>
        <Title headingLevel="h3">Account roles</Title>
      </GridItem>
      {showAccountRolesError ? (
        <GridItem span={8}>
          <AWSAccountRolesError
            getAWSAccountRolesARNsResponse={getAWSAccountRolesARNsResponse}
            isHypershiftSelected={isHypershiftSelected}
            isMissingOCMRole={isMissingOCMRole}
          />
        </GridItem>
      ) : null}
      {!hasFinishedLoadingRoles && (
        <GridItem>
          <div className="spinner-fit-container">
            <Spinner size="lg" aria-label="Loading..." />
          </div>
          <div className="spinner-loading-text" data-testid="spinner-loading-arn-text">
            Loading account roles ARNs...
          </div>
        </GridItem>
      )}
      {hasFinishedLoadingRoles && (
        <GridItem span={12}>
          <ExpandableSection
            isExpanded={isExpanded}
            onToggle={onToggle}
            toggleText="Account roles ARNs"
          >
            <Content component={ContentVariants.p}>
              The following roles were detected in your AWS account.{' '}
              <ExternalLink
                href={
                  isHypershiftSelected
                    ? links.ROSA_AWS_IAM_RESOURCES
                    : links.ROSA_CLASSIC_AWS_IAM_RESOURCES
                }
              >
                Learn more about account roles
              </ExternalLink>
              .
            </Content>
            <br />
            <Button
              variant="secondary"
              data-testid="refresh_arns_btn"
              onClick={() => {
                track(trackEvents.RefreshARNs);
                refreshARNs();
              }}
            >
              Refresh ARNs
            </Button>
            <br />
            <br />
            <Grid>
              <GridItem span={8}>
                <Field
                  component={ReduxSelectDropdown}
                  name={FieldId.InstallerRoleArn}
                  input={{
                    // name, value, onBlur, onChange
                    ...getFieldProps(FieldId.InstallerRoleArn),
                    onChange: (value) => {
                      onInstallerRoleChange(null, value);
                    },
                  }}
                  meta={getFieldMeta(FieldId.InstallerRoleArn)}
                  label="Installer role"
                  type="text"
                  options={installerRoleOptions}
                  isDisabled={installerRoleOptions.length <= 1}
                  validate={roleARNRequired}
                  isRequired
                  helpText=""
                  extendedHelpText={
                    <>
                      An IAM role used by the ROSA installer. The role is used with the
                      corresponding policy resource to provide the installer with the permissions
                      required to complete cluster installation tasks.
                    </>
                  }
                />
                <br />
                <Field
                  component={ReduxVerticalFormGroup}
                  name={FieldId.SupportRoleArn}
                  input={{
                    // name, value, onBlur, onChange
                    ...getFieldProps(FieldId.SupportRoleArn),
                    onChange: (value) => setFieldValue(FieldId.SupportRoleArn, value, false),
                  }}
                  meta={getFieldMeta(FieldId.SupportRoleArn)}
                  label="Support role"
                  type="text"
                  validate={roleARNRequired}
                  isRequired
                  // An IAM role used by the Red Hat Site Reliability Engineering (SRE) support team.
                  extendedHelpText={
                    <>
                      An IAM role used by the Red Hat Site Reliability Engineering (SRE) support
                      team. The role is used with the corresponding policy resource to provide the
                      Red Hat SRE support team with the permissions required to support ROSA
                      clusters.
                    </>
                  }
                  isDisabled
                />
                <br />
                <Field
                  component={ReduxVerticalFormGroup}
                  name={FieldId.WorkerRoleArn}
                  input={{
                    // name, value, onBlur, onChange
                    ...getFieldProps(FieldId.WorkerRoleArn),
                    onChange: (value) => setFieldValue(FieldId.WorkerRoleArn, value, false),
                  }}
                  meta={getFieldMeta(FieldId.WorkerRoleArn)}
                  label="Worker role"
                  type="text"
                  validate={roleARNRequired}
                  isRequired
                  extendedHelpText={
                    <>
                      An IAM role used by the ROSA compute instances. The role is used with the
                      corresponding policy resource to provide the compute instances with the
                      permissions required to manage their components.
                    </>
                  }
                  isDisabled
                />
                {!isHypershiftSelected && (
                  <>
                    <br />
                    <Field
                      component={ReduxVerticalFormGroup}
                      name={FieldId.ControlPlaneRoleArn}
                      input={{
                        // name, value, onBlur, onChange
                        ...getFieldProps(FieldId.ControlPlaneRoleArn),
                        onChange: (value) =>
                          setFieldValue(FieldId.ControlPlaneRoleArn, value, false),
                      }}
                      meta={getFieldMeta(FieldId.ControlPlaneRoleArn)}
                      label="Control plane role"
                      type="text"
                      validate={roleARNRequired}
                      isRequired
                      extendedHelpText={
                        <>
                          An IAM role used by the ROSA control plane. The role is used with the
                          corresponding policy resource to provide the control plane with the
                          permissions required to manage its components.
                        </>
                      }
                      isDisabled
                    />
                  </>
                )}
              </GridItem>
              {(rosaMaxOSVersion || hasStandaloneManagedRole) && (
                <GridItem>
                  <br />
                  <Alert
                    variant="info"
                    isInline
                    isPlain={hasStandaloneManagedRole || !rolesOutOfDate}
                    title={arnCompatibilityAlertTitle}
                  >
                    {rolesOutOfDate && !(hasStandaloneManagedRole || isHypershiftSelected) && (
                      <Content>
                        <Content component={ContentVariants.p} className="pf-v6-u-mt-sm">
                          <strong>
                            To update account roles to the latest OpenShift version (
                            {formatMinorVersion(latestOCPVersion)}):
                          </strong>
                        </Content>
                        <Content component={ContentVariants.ol}>
                          <Content component="li">
                            <Content component={ContentVariants.p}>
                              Download latest ({formatMinorVersion(latestOCPVersion)}){' '}
                              <Link to="/downloads#tool-ocm">ocm</Link> and{' '}
                              <Link to="/downloads#tool-rosa">rosa</Link> CLIs
                            </Content>
                          </Content>
                          <Content component="li" className="pf-v6-u-mb-sm">
                            <Content component={ContentVariants.p}>Recreate ARNs using</Content>
                            <Content component={ContentVariants.p}>
                              <InstructionCommand textAriaLabel="Copyable ROSA create account-roles command">
                                {RosaCliCommand.CreateAccountRoles}
                              </InstructionCommand>
                            </Content>
                          </Content>
                        </Content>
                        {/*
                        // TODO restore this when we have a doc URL (see https://issues.redhat.com/browse/OSDOCS-4138)
                        <Text component={TextVariants.p}>
                          <ExternalLink href="#">
                            Learn more about account-role version compatibility
                          </ExternalLink>
                        </Text>
                        */}
                      </Content>
                    )}
                  </Alert>
                </GridItem>
              )}
            </Grid>
            <GridItem span={4} />
          </ExpandableSection>
        </GridItem>
      )}
    </>
  );
}

AccountRolesARNsSection.propTypes = {
  selectedAWSAccountID: PropTypes.string,
  selectedInstallerRoleARN: PropTypes.string,
  rosaMaxOSVersion: PropTypes.string,
  getAWSAccountRolesARNs: PropTypes.func.isRequired,
  getAWSAccountRolesARNsResponse: PropTypes.object.isRequired,
  clearGetAWSAccountRolesARNsResponse: PropTypes.func.isRequired,
  isHypershiftSelected: PropTypes.bool,
  onAccountChanged: PropTypes.func.isRequired,
};

export default AccountRolesARNsSection;
