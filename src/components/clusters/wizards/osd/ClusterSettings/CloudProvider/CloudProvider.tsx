import React from 'react';
import { useDispatch } from 'react-redux';

import { Alert, Form, Title } from '@patternfly/react-core';

import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { useIsOsdGcp } from '~/hooks/useIsOsdGcp';
import { clearCcsCredientialsInquiry } from '~/redux/actions/ccsInquiriesActions';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { clusterService } from '~/services';

import { GcpByocFields } from './GcpByocFields/GcpByocFields';
import { AwsByocFields } from './AwsByocFields';
import { CloudProviderTileField } from './CloudProviderTileField';

export const CloudProvider = () => {
  const dispatch = useDispatch();
  const {
    values: {
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.Byoc]: byoc,
      [FieldId.AccountId]: accountId,
      [FieldId.AccessKeyId]: accessKeyId,
      [FieldId.SecretAccessKey]: secretAccessKey,
      [FieldId.GcpServiceAccount]: gcpServiceAccount,
      [FieldId.GcpAuthType]: gcpAuthType,
    },
  } = useFormState();
  const { ccsCredentialsValidity } = useGlobalState((state) => state.ccsInquiries);
  const isByoc = byoc === 'true';
  const isOsdGcp = useIsOsdGcp();
  React.useEffect(() => {
    dispatch(clearCcsCredientialsInquiry());
  }, [
    accountId,
    accessKeyId,
    secretAccessKey,
    gcpServiceAccount,
    cloudProvider,
    gcpAuthType,
    dispatch,
  ]);

  return (
    <Form>
      {!isOsdGcp && <Title headingLevel="h3">Select a cloud provider</Title>}
      <CloudProviderTileField />
      {isByoc && (
        <>
          {cloudProvider === CloudProviderType.Aws ? (
            <AwsByocFields />
          ) : (
            <GcpByocFields getWifConfigsService={clusterService.getGCPWifConfigs} />
          )}

          {ccsCredentialsValidity.error && (
            <Alert
              variant="danger"
              isInline
              title={`${cloudProvider.toUpperCase()} wasn't able to verify your credentials`}
            >
              Verify that your entered{' '}
              {cloudProvider === CloudProviderType.Aws
                ? 'access keys match the access keys provided in your AWS account.'
                : 'service account details are correct.'}
            </Alert>
          )}
        </>
      )}
    </Form>
  );
};
