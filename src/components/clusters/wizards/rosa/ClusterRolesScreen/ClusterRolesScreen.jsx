import React, { useEffect, useState } from 'react';
import { Field } from 'formik';

import {
  Alert,
  Button,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Spinner,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import { useFormState } from '~/components/clusters/wizards/hooks';
import {
  createOperatorRolesPrefix,
  getOperatorRolesCommand,
} from '~/components/clusters/wizards/rosa/ClusterRolesScreen/clusterRolesHelper';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import useAnalytics from '~/hooks/useAnalytics';
import { MULTIREGION_PREVIEW_ENABLED } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import {
  refetchGetOCMRole,
  useFetchGetOCMRole,
} from '~/queries/RosaWizardQueries/useFetchGetOCMRole';

import links from '../../../../../common/installLinks.mjs';
import { required } from '../../../../../common/validators';
import ErrorBox from '../../../../common/ErrorBox';
import ExternalLink from '../../../../common/ExternalLink';
import InstructionCommand from '../../../../common/InstructionCommand';
import PopoverHint from '../../../../common/PopoverHint';
import RadioButtons from '../../../../common/ReduxFormComponents_deprecated/RadioButtons';
import { BackToAssociateAwsAccountLink } from '../common/BackToAssociateAwsAccountLink';

import CustomerOIDCConfiguration from './CustomerOIDCConfiguration';
import CustomOperatorRoleNames from './CustomOperatorRoleNames';

const roleModes = {
  MANUAL: 'manual',
  AUTO: 'auto',
};

const ClusterRolesScreen = () => {
  const {
    setFieldValue,
    getFieldProps,
    getFieldMeta,
    validateForm,
    values: {
      [FieldId.ClusterName]: clusterName,
      [FieldId.Hypershift]: hypershiftValue,
      [FieldId.AssociatedAwsId]: awsAccountID,
      [FieldId.RosaRolesProviderCreationMode]: rosaCreationMode,
      [FieldId.CustomOperatorRolesPrefix]: customOperatorRolesPrefix,
      [FieldId.ByoOidcConfigId]: byoOidcConfigID,
      [FieldId.InstallerRoleArn]: installerRoleArn,
      [FieldId.RegionalInstance]: regionalInstance,
    },
  } = useFormState();

  const isHypershiftSelected = hypershiftValue === 'true';
  const isMultiRegionEnabled = useFeatureGate(MULTIREGION_PREVIEW_ENABLED) && isHypershiftSelected;

  const [isAutoModeAvailable, setIsAutoModeAvailable] = useState(false);
  const [hasByoOidcConfig, setHasByoOidcConfig] = useState(
    !!(isHypershiftSelected || byoOidcConfigID),
  );

  const [getOCMRoleErrorBox, setGetOCMRoleErrorBox] = useState(null);
  const track = useAnalytics();

  const regionSearch = regionalInstance?.id;

  const {
    data: getOCMRoleData,
    error: getOCMRoleError,
    isPending: isGetOCMRolePending,
    isSuccess: isGetOCMRoleSuccess,
    status: getOCMRoleStatus,
  } = useFetchGetOCMRole(awsAccountID);

  const toggleByoOidcConfig = (isChecked) => () => {
    if (isChecked) {
      setFieldValue(
        FieldId.RosaRolesProviderCreationMode,
        isAutoModeAvailable ? roleModes.AUTO : roleModes.MANUAL,
      );
    } else {
      setFieldValue(FieldId.ByoOidcConfigId, '');
      setFieldValue(FieldId.ByoOidcConfigIdManaged, '');
    }
    setHasByoOidcConfig(isChecked);
  };

  const onSelectOIDCConfig = (oidcConfig) => {
    const promiseArr = [
      setFieldValue(FieldId.ByoOidcConfigId, oidcConfig ? oidcConfig.id : '', false),
      setFieldValue(
        FieldId.ByoOidcConfigIdManaged,
        !oidcConfig || oidcConfig.managed ? 'true' : 'false',
        false,
      ),
    ];
    Promise.all(promiseArr).then(() => {
      setTimeout(validateForm);
    });
  };

  useEffect(() => {
    if (!customOperatorRolesPrefix) {
      setFieldValue(FieldId.CustomOperatorRolesPrefix, createOperatorRolesPrefix(clusterName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customOperatorRolesPrefix, clusterName]);

  useEffect(() => {
    // clearing the ocm_role_response results in ocm role being re-fetched
    // when navigating to this step (from Next or Back)
    refetchGetOCMRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rosaCreationMode && isGetOCMRoleSuccess) {
    setFieldValue(
      FieldId.RosaRolesProviderCreationMode,
      getOCMRoleData.data?.isAdmin ? roleModes.AUTO : roleModes.MANUAL,
    );
  }

  useEffect(() => {
    if (isGetOCMRolePending) {
      setGetOCMRoleErrorBox(null);
    } else if (isGetOCMRoleSuccess) {
      if (FieldId.RosaCreatorArn !== getOCMRoleData.data?.arn) {
        setFieldValue(FieldId.RosaCreatorArn, getOCMRoleData.data?.arn);
      }
      const isAdmin = getOCMRoleData.data?.isAdmin;
      setIsAutoModeAvailable(isAdmin);
      setGetOCMRoleErrorBox(null);
    } else if (getOCMRoleError) {
      // display error
      setGetOCMRoleErrorBox(
        <ErrorBox
          message="ocm-role is no longer linked to your Red Hat organization"
          response={getOCMRoleError?.errorMessage}
          isExpandable
        >
          <BackToAssociateAwsAccountLink />
        </ErrorBox>,
      );
    } else {
      refetchGetOCMRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getOCMRoleStatus]);

  const handleRefresh = () => {
    refetchGetOCMRole();
    setFieldValue(FieldId.RosaRolesProviderCreationMode, undefined);
    track(trackEvents.OCMRoleRefreshed);
  };

  const handleCreationModeChange = (value) => {
    // Going to Next step and Back, triggers this onChange with value undefined?!
    if (value) {
      setFieldValue(FieldId.RosaRolesProviderCreationMode, value);
      track(trackEvents.RosaCreationMode, {
        customProperties: {
          value,
        },
      });
    }
  };

  const EnableAutoModeTip = (
    <Alert
      className="pf-v6-u-ml-lg"
      variant="info"
      isInline
      isExpandable
      title="If you would like to enable auto mode, expand the alert and follow the steps below."
    >
      <Content className="pf-v6-u-font-size-sm">
        <Content component={ContentVariants.p} className="pf-v6-u-mb-sm">
          Create the Admin OCM role using the following command in the ROSA CLI. Only one OCM role
          can be linked per Red Hat org.{' '}
          <PopoverHint title="If an OCM role with basic privileges exists in your account, you might need to delete or unlink the role before creating an OCM role with administrative privileges." />
        </Content>
        <InstructionCommand
          textAriaLabel="Copyable ROSA create ocm-role command"
          trackEvent={trackEvents.CopyOCMRoleCreateAdmin}
        >
          rosa create ocm-role --admin
        </InstructionCommand>
        <Content component={ContentVariants.p} className="pf-v6-u-mb-sm">
          If not yet linked, run the following command to associate the OCM role with your AWS{' '}
          account.
        </Content>
        <InstructionCommand
          textAriaLabel="Copyable ROSA link ocm-role command"
          trackEvent={trackEvents.CopyOCMRoleLink}
        >
          rosa link ocm-role &lt;arn&gt;
        </InstructionCommand>
        <Content component={ContentVariants.p} className="pf-v6-u-mb-sm">
          After running the command, you may need to refresh using the button below to enable auto
          mode.
        </Content>
        <Button onClick={handleRefresh} variant="secondary">
          Refresh to enable auto mode
        </Button>
      </Content>
    </Alert>
  );

  const roleModeOptions = [
    {
      value: roleModes.MANUAL,
      label: 'Manual',
      description: (
        <>
          You can choose from two options to manually generate the necessary roles and policies for
          your cluster operators and the OIDC provider: ROSA CLI commands, or AWS CLI commands.{' '}
          <strong>
            You must complete one of those options after cluster review for your cluster to complete
            installation.
          </strong>
        </>
      ),
    },
    {
      disabled: !isAutoModeAvailable,
      value: roleModes.AUTO,
      label: 'Auto',
      description:
        'Immediately create the necessary cluster operator roles and OIDC provider. This mode requires an admin privileged OCM role.',
      extraField: isGetOCMRoleSuccess && !isAutoModeAvailable && EnableAutoModeTip,
    },
  ];

  const operatorRolesCliCommand = getOperatorRolesCommand({
    isHypershiftSelected,
    byoOidcConfigID,
    customOperatorRolesPrefix,
    installerRoleArn,
  });

  return (
    <Form onSubmit={() => false}>
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">Cluster roles and policies</Title>
        </GridItem>
        {isHypershiftSelected ? (
          <Alert
            isInline
            id="rosa-require-byo-oidc"
            variant="info"
            title="Hosted control plane clusters require a specified OIDC provider."
          />
        ) : (
          <>
            <GridItem>
              <Content component={ContentVariants.p}>
                Set whether you&apos;d like to create the OIDC now or wait to create the OIDC until
                after installation.
              </Content>
            </GridItem>
            <GridItem>
              <ToggleGroup>
                <ToggleGroupItem
                  text="Create OIDC Later"
                  buttonId="managed-oidc-configuration"
                  isSelected={!hasByoOidcConfig}
                  onChange={toggleByoOidcConfig(false)}
                />
                <ToggleGroupItem
                  text="Create OIDC Now"
                  buttonId="customer-oidc-configuration"
                  isSelected={hasByoOidcConfig}
                  onChange={toggleByoOidcConfig(true)}
                />
              </ToggleGroup>
            </GridItem>
          </>
        )}
        {getOCMRoleErrorBox && <GridItem>{getOCMRoleErrorBox}</GridItem>}
        {isGetOCMRolePending && (
          <GridItem>
            <div className="spinner-fit-container">
              <Spinner size="lg" aria-label="Loading..." />
            </div>
            <div className="spinner-loading-text pf-v6-u-ml-xl">Checking for admin OCM role...</div>
          </GridItem>
        )}
        {isGetOCMRoleSuccess && !hasByoOidcConfig && (
          <>
            <GridItem>
              <Content component={ContentVariants.p}>
                Choose the preferred mode for creating the operator roles and OIDC provider.{' '}
                <ExternalLink
                  href={
                    isHypershiftSelected
                      ? links.ROSA_AWS_IAM_RESOURCES
                      : links.ROSA_CLASSIC_AWS_IAM_RESOURCES
                  }
                >
                  Learn more about ROSA roles
                </ExternalLink>
              </Content>
            </GridItem>
            <GridItem span={10}>
              <FormGroup isRequired fieldId="role_mode">
                <Field
                  component={RadioButtons}
                  name={FieldId.RosaRolesProviderCreationMode}
                  className="radio-button"
                  disabled={isGetOCMRolePending}
                  options={roleModeOptions}
                  disableDefaultValueHandling
                  input={{
                    ...getFieldProps(FieldId.RosaRolesProviderCreationMode),
                    onChange: handleCreationModeChange,
                  }}
                  meta={getFieldMeta(FieldId.RosaRolesProviderCreationMode)}
                />
              </FormGroup>
            </GridItem>
          </>
        )}
        {hasByoOidcConfig ? (
          <Field
            component={CustomerOIDCConfiguration}
            name={FieldId.ByoOidcConfigId}
            label="Config ID"
            awsAccountID={awsAccountID}
            byoOidcConfigID={byoOidcConfigID}
            operatorRolesCliCommand={operatorRolesCliCommand}
            regionSearch={regionSearch}
            isMultiRegionEnabled={isMultiRegionEnabled}
            validate={required}
            input={{
              ...getFieldProps(FieldId.ByoOidcConfigId),
              onChange: onSelectOIDCConfig,
            }}
            meta={getFieldMeta(FieldId.ByoOidcConfigId)}
          />
        ) : (
          <CustomOperatorRoleNames isHypershiftSelected={isHypershiftSelected} />
        )}
      </Grid>
    </Form>
  );
};

export default ClusterRolesScreen;
