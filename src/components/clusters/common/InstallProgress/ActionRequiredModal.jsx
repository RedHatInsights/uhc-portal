import React from 'react';
import PropTypes from 'prop-types';

import {
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  ContentVariants,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';

import { MULTIREGION_PREVIEW_ENABLED } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import {
  isErrorSharedGCPVPCValues,
  isHypershiftCluster,
  isWaitingForOIDCProviderOrOperatorRolesMode,
  isWaitingROSAManualMode,
} from '../clusterStates';

// import CloudFormationTab from './CloudFormationTab';
import AWSCLITab from './AWSCLITab';
import ROSACLITab from './ROSACLITab';

const ROSA_CLI_TAB_INDEX = 1;
const AWS_CLI_TAB_INDEX = 2;

function ActionRequiredModal({ cluster, isOpen, onClose, regionalInstance }) {
  const isWaitingAndROSAManual = isWaitingROSAManualMode(cluster);
  const isHCPCluster = isHypershiftCluster(cluster);
  const isWaitingForOIDCProviderOrOperatorRoles =
    isWaitingForOIDCProviderOrOperatorRolesMode(cluster);
  const isBadSharedGCPVPCValues = isErrorSharedGCPVPCValues(cluster);
  const [activeTab, setActiveTab] = React.useState(ROSA_CLI_TAB_INDEX);
  const isMultiRegionEnabled =
    useFeatureGate(MULTIREGION_PREVIEW_ENABLED) && isHCPCluster && regionalInstance;

  const createByOIDCId = (cluster) => {
    const oidcConfigID = cluster.aws.sts?.oidc_config?.id;
    const operatorRolePrefix = cluster.aws?.sts?.operator_role_prefix;
    const installerRole = cluster.aws?.sts?.role_arn;
    const rosaRegionLoginCommand = `rosa login --use-auth-code --url ${regionalInstance?.url}`;
    const operatorRolesCliCommand = `rosa create operator-roles ${
      isHCPCluster ? '--hosted-cp' : ''
    } --prefix "${operatorRolePrefix}" --oidc-config-id "${oidcConfigID}"  --installer-role-arn ${installerRole}`;
    const oidcProviderCliCommand = `rosa create oidc-provider --oidc-config-id "${oidcConfigID}"`;

    return (
      <Stack hasGutter>
        <StackItem>
          <Content className="pf-v6-u-pb-md">
            <Content component={ContentVariants.p}>
              Your cluster will proceed to ready state only after the operator roles and OIDC
              provider are created.
            </Content>
          </Content>
        </StackItem>
        {isMultiRegionEnabled ? (
          <StackItem>
            <Content>
              <Content component={ContentVariants.p}>
                To log in to your cluster&apos;s region, run the following command:
              </Content>
              <ClipboardCopy
                textAriaLabel="Copyable ROSA region login"
                variant={ClipboardCopyVariant.expansion}
                isReadOnly
              >
                {rosaRegionLoginCommand}
              </ClipboardCopy>
            </Content>
          </StackItem>
        ) : null}
        <StackItem>
          <Content>
            <Content component={ContentVariants.p}>
              To create the operator roles, run the following command:
            </Content>
            <ClipboardCopy
              textAriaLabel="Copyable ROSA create operator-roles"
              variant={ClipboardCopyVariant.expansion}
              isReadOnly
            >
              {operatorRolesCliCommand}
            </ClipboardCopy>
          </Content>
        </StackItem>
        <StackItem>
          <Content className="pf-v6-u-pb-md">
            <Content component={ContentVariants.p}>
              {' '}
              To create an OIDC provider, run the following command:
            </Content>
            <ClipboardCopy
              textAriaLabel="Copyable ROSA OIDC provider"
              variant={ClipboardCopyVariant.expansion}
              isReadOnly
            >
              {oidcProviderCliCommand}
            </ClipboardCopy>
          </Content>
        </StackItem>
      </Stack>
    );
  };

  const createInteractively = (
    <Stack hasGutter>
      <StackItem>
        You must create the <b>operator roles</b> and <b>OIDC provider</b> to complete cluster
        installation.
      </StackItem>
      <StackItem>Use one of the following methods:</StackItem>
      <StackItem>
        <Tabs activeKey={activeTab} onSelect={(_, tab) => setActiveTab(tab)} isBox>
          {/* Hide the CloudFormation tab until the templates are published to a URL.
            <Tab
              eventKey={0}
              title={<TabTitleText>AWS CloudFormation</TabTitleText>}
              tabContentId="cloudformation"
            />
            */}
          <Tab
            eventKey={ROSA_CLI_TAB_INDEX}
            title={<TabTitleText>ROSA CLI</TabTitleText>}
            tabContentId="rosa-cli"
          />
          <Tab
            eventKey={AWS_CLI_TAB_INDEX}
            title={<TabTitleText>AWS CLI</TabTitleText>}
            tabContentId="aws-cli"
          />
        </Tabs>
      </StackItem>
      <StackItem>
        {/* Hide the CloudFormation tab until the templates are published to a URL.
          <TabContent
            key={0}
            eventKey={0}
            id="cloudformation"
            activeKey={activeTab}
            hidden={activeTab !== 0}
          >
            <CloudFormationTab cluster={cluster} />
          </TabContent>
          */}
        <TabContent
          key={ROSA_CLI_TAB_INDEX}
          eventKey={ROSA_CLI_TAB_INDEX}
          id="rosa-cli"
          activeKey={activeTab}
          hidden={activeTab !== ROSA_CLI_TAB_INDEX}
        >
          <ROSACLITab cluster={cluster} />
        </TabContent>
        <TabContent
          key={AWS_CLI_TAB_INDEX}
          eventKey={AWS_CLI_TAB_INDEX}
          id="aws-cli"
          activeKey={activeTab}
          hidden={activeTab !== AWS_CLI_TAB_INDEX}
        >
          <AWSCLITab cluster={cluster} />
        </TabContent>
      </StackItem>
      <StackItem>
        The options above will be available until the operator roles and OIDC provider are detected.
      </StackItem>
    </Stack>
  );

  const showGCPVPCSharedError = (
    <Stack hasGutter>
      <StackItem>
        <Content className="pf-v6-u-pb-md">
          <Content component={ContentVariants.p}>{cluster?.status?.description}</Content>
          <Content component={ContentVariants.p}>You entered these values:</Content>
        </Content>
        <Content>
          <Content component="ul">
            <Content component="li">{`Existing VPC name: ${cluster.gcp_network?.vpc_name}`}</Content>
            <Content component="li">
              {`Control plane subnet name: ${cluster.gcp_network?.control_plane_subnet}`}
            </Content>
            <Content component="li">
              {`Compute subnet name: ${cluster.gcp_network?.compute_subnet}`}
            </Content>
          </Content>
        </Content>
      </StackItem>
    </Stack>
  );

  return (
    <Modal
      id="action-required-installation-modal"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.medium}
      aria-labelledby="action-required-installation-modal"
      aria-describedby="modal-box-action-required-installation"
    >
      <ModalHeader
        title="Action required to continue installation"
        labelId="action-required-installation-modal"
      />
      <ModalBody>
        {isWaitingAndROSAManual && createInteractively}
        {isWaitingForOIDCProviderOrOperatorRoles && createByOIDCId(cluster)}
        {isBadSharedGCPVPCValues && showGCPVPCSharedError}
      </ModalBody>
    </Modal>
  );
}

ActionRequiredModal.propTypes = {
  cluster: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  regionalInstance: PropTypes.shape({
    environment: PropTypes.string,
    id: PropTypes.string,
    isDefault: PropTypes.bool,
    url: PropTypes.string,
  }),
};

export default ActionRequiredModal;
