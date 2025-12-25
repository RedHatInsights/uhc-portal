import React from 'react';
import { Field } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch } from 'react-redux';

import { Content, GridItem } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import { required } from '~/common/validators';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { getGcpCcsCredentials } from '~/components/clusters/wizards/common/utils/ccsCredentials';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import DynamicSelect from '~/components/common/DynamicSelect';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { getGCPKeys } from '~/redux/actions/ccsInquiriesActions';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { EncryptionKey } from '~/types/clusters_mgmt.v1';

export const KmsKeySelect = () => {
  const dispatch = useDispatch();
  const { gcpKeys } = useGlobalState((state) => state.ccsInquiries);
  const { values, getFieldProps, setFieldValue, getFieldMeta } = useFormState();
  const ccsCredentials = getGcpCcsCredentials(values);

  const {
    [FieldId.KeyLocation]: keyLocation,
    [FieldId.KeyRing]: keyRing,
    [FieldId.GcpAuthType]: gcpAuthType,
  } = values;
  const hasDependencies = !!(ccsCredentials && keyLocation && keyRing);
  const matchesDependencies =
    gcpKeys.cloudProvider === 'gcp' &&
    isEqual(gcpKeys.credentials, ccsCredentials) &&
    gcpKeys.keyLocation === keyLocation &&
    gcpKeys.keyRing === keyRing;

  return (
    <GridItem>
      <Field
        component={DynamicSelect}
        name={FieldId.KeyName}
        label="Key name"
        labelIcon={<PopoverHint hint={constants.keyName} />}
        helperText="Name of the key in the keyring."
        placeholder="Select key"
        requestErrorTitle="Error listing keys using your Google Cloud credentials"
        emptyAlertTitle="No keys found for this location and key ring"
        emptyAlertBody={
          <>
            <Content component="p">
              If available, change the Key ring location / Key ring. Or go to your{' '}
              <ExternalLink href={installLinks.GCP_CONSOLE_KMS}>Google Cloud Console</ExternalLink>{' '}
              and create the key.
            </Content>
            <Content component="p">
              Once created, refresh using the <strong>Refresh custom keys</strong> button.
            </Content>
          </>
        }
        refreshButtonText="Refresh custom keys"
        validate={required}
        isRequired
        input={{
          ...getFieldProps(FieldId.KeyName),
          onChange: (value: string) => setFieldValue(FieldId.KeyName, value),
        }}
        meta={getFieldMeta(FieldId.KeyName)}
        loadData={() =>
          hasDependencies && dispatch(getGCPKeys(gcpAuthType, ccsCredentials, keyLocation, keyRing))
        }
        hasDependencies={hasDependencies}
        matchesDependencies={matchesDependencies}
        requestStatus={gcpKeys}
        items={(gcpKeys.data?.items || []).map((key: EncryptionKey) => key.name)}
      />
    </GridItem>
  );
};
