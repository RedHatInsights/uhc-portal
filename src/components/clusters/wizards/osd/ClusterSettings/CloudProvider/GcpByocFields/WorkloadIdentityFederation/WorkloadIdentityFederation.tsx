import React, { useEffect } from 'react';
import { AxiosResponse } from 'axios';
import { Field } from 'formik';

import {
  Alert,
  ClipboardCopy,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { useGetWifConfigs } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/WorkloadIdentityFederation/useWifConfigs';
import { WifConfigSelector } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/GcpByocFields/WorkloadIdentityFederation/WifConfigSelector';
import { WifConfigList } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import ExternalLink from '~/components/common/ExternalLink';
import { WifConfig } from '~/types/clusters_mgmt.v1';

export interface WorkloadIdentityFederationProps {
  getWifConfigsService: (projectId: string) => Promise<AxiosResponse<WifConfigList>>;
}

const createCommand = `ocm gcp create wif-config --name <wif_name> --project <gcp_project_id>`;

const WorkloadIdentityFederation = (props: WorkloadIdentityFederationProps) => {
  const { getWifConfigsService } = props;
  const { isLoading, wifConfigs, getWifConfigs, error } = useGetWifConfigs(getWifConfigsService);

  useEffect(() => {
    getWifConfigs('');
  }, [getWifConfigs]);

  const {
    setFieldValue,
    getFieldProps,
    getFieldMeta,
    values: { [FieldId.GcpWifConfig]: selectedGcpWifConfig },
  } = useFormState();

  const handleWifSelection = (id: string) => {
    const selection = (wifConfigs ?? []).find((config) => config.id === id);
    if (selection) {
      setFieldValue(FieldId.GcpWifConfig, selection, true);
    }
  };

  const validateWifConfig = (value?: WifConfig) =>
    value?.id ? undefined : 'Wif configuration is required';

  useEffect(() => {
    // if the selected wif config value is not in the wif config list, reset the selection
    // this edge case could happen if the user deletes a wif config after he selected it
    if (
      wifConfigs &&
      selectedGcpWifConfig &&
      !wifConfigs.find((config) => config.id === selectedGcpWifConfig.id)
    ) {
      setFieldValue(FieldId.GcpWifConfig, null, true);
    }
  }, [wifConfigs, selectedGcpWifConfig, setFieldValue]);

  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component="h4">
            1. Create a new Workload Identity Federation (WIF) configuration
          </Text>

          <Text component={TextVariants.p}>
            Workload Identity Federation is a keyless authentication mechanism for calling Google
            Cloud APIs. It eliminates the maintenance and security burden associated with service
            account keys.
          </Text>
          <Text component={TextVariants.p}>
            Run the following <code>ocm</code> CLI command to create a Workload Identity Federation
            configuration (automatic mode). Make sure to replace the WIF name and GCP Project ID
            with your own values.
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <ClipboardCopy
          data-testid="gcp-wif-command"
          isReadOnly
          hoverTip="Copy"
          clickTip="Copied"
          isCode
          isBlock
        >
          {createCommand}
        </ClipboardCopy>
      </StackItem>
      <StackItem>
        <TextContent>
          <Text component={TextVariants.small}>
            This command creates all the necessary resources for deploying OSD on GCP using only
            temporary credentials. You can also run the command in manual mode.{' '}
            <ExternalLink noIcon href={links.OSD_CCS_GCP_WIF_CREATION_LEARN_MORE}>
              Learn more
            </ExternalLink>
            .
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <TextContent>
          <Text component="h4">2. Select configuration</Text>
        </TextContent>
      </StackItem>
      {error ? (
        <StackItem>
          <Alert variant="danger" isInline title="Error retrieving WIF configurations" />
        </StackItem>
      ) : null}
      <StackItem>
        <Field
          component={WifConfigSelector}
          name={FieldId.GcpWifConfig}
          input={{
            ...getFieldProps(FieldId.GcpWifConfig),
            onChange: handleWifSelection,
          }}
          meta={getFieldMeta(FieldId.GcpWifConfig)}
          onRefresh={() => getWifConfigs('')}
          isLoading={isLoading}
          validate={validateWifConfig}
          wifConfigs={wifConfigs ?? []}
          selectedWifConfigID={selectedGcpWifConfig?.id}
        />
      </StackItem>
    </Stack>
  );
};

export { WorkloadIdentityFederation };
