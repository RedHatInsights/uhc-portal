import React from 'react';
import { Field } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch } from 'react-redux';

import { Content, GridItem } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import { required } from '~/common/validators';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { getGcpCcsCredentials } from '~/components/clusters/wizards/common/utils/ccsCredentials';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import DynamicSelect from '~/components/common/DynamicSelect';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { getGCPKeyRings } from '~/redux/actions/ccsInquiriesActions';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { KeyRing } from '~/types/clusters_mgmt.v1';

export const KmsKeyRingSelect = () => {
  const dispatch = useDispatch();
  const { gcpKeyRings } = useGlobalState((state) => state.ccsInquiries);
  const { values, getFieldProps, setFieldValue, getFieldMeta } = useFormState();
  const ccsCredentials = getGcpCcsCredentials(values);

  const { [FieldId.GcpAuthType]: gcpAuthType, [FieldId.KeyLocation]: keyLocation } = values;
  const hasDependencies = !!(ccsCredentials && keyLocation);
  const matchesDependencies =
    gcpKeyRings.cloudProvider === CloudProviderType.Gcp &&
    isEqual(gcpKeyRings.credentials, ccsCredentials) &&
    gcpKeyRings.keyLocation === keyLocation;

  return (
    <GridItem>
      <Field
        component={DynamicSelect}
        name={FieldId.KeyRing}
        label="Key ring"
        labelIcon={<PopoverHint hint={constants.keyRing} />}
        helperText="A key ring organizes keys in a specific Google Cloud location."
        noDependenciesPlaceholder="Enter GCP credentials first"
        placeholder="Select key ring"
        requestErrorTitle="Error listing key rings using your Google Cloud credentials"
        emptyAlertTitle="No key rings found for this location"
        emptyAlertBody={
          <>
            <Content component="p">
              If available, change the Key ring location. Or go to your{' '}
              <ExternalLink href={installLinks.GCP_CONSOLE_KMS}>Google Cloud Console</ExternalLink>{' '}
              and create the key ring.
            </Content>
            <Content component="p">
              Once created, refresh using the <strong>Refresh custom key rings</strong> button.
            </Content>
          </>
        }
        refreshButtonText="Refresh custom key rings"
        validate={required}
        isRequired
        input={{
          ...getFieldProps(FieldId.KeyRing),
          onChange: (value: string) => setFieldValue(FieldId.KeyRing, value),
        }}
        meta={getFieldMeta(FieldId.KeyRing)}
        hasDependencies={hasDependencies}
        matchesDependencies={matchesDependencies}
        requestStatus={gcpKeyRings}
        items={(gcpKeyRings.data?.items || []).map((ring: KeyRing) => ring.name)}
        loadData={() =>
          hasDependencies && dispatch(getGCPKeyRings(gcpAuthType, ccsCredentials, keyLocation))
        }
      />
    </GridItem>
  );
};
