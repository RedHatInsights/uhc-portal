import React from 'react';
import { Field } from 'formik';

import { FormGroup, GridItem } from '@patternfly/react-core';

import { validateGCPKMSServiceAccount } from '~/common/validators';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import KMSKeyLocationComboBox from '~/components/clusters/wizards/common/EncryptionSection/KMSKeyLocationComboBox';
import { TextInputField } from '~/components/clusters/wizards/form';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import PopoverHint from '~/components/common/PopoverHint';

import { KmsKeyRingSelect } from './KmsKeyRingSelect';
import { KmsKeySelect } from './KmsKeySelect';

interface GcpEncryptionProps {
  region: string;
}

export const GcpEncryption = ({ region }: GcpEncryptionProps) => {
  const { getFieldProps, setFieldValue } = useFormState();

  return (
    <>
      <GridItem>
        <FormGroup
          label="Key ring location"
          fieldId={FieldId.KeyLocation}
          labelHelp={<PopoverHint hint={constants.regionHint} />}
        >
          <Field
            component={KMSKeyLocationComboBox}
            name={FieldId.KeyLocation}
            selectedRegion={region}
            input={{
              ...getFieldProps(FieldId.KeyLocation),
              onChange: (value: string) => setFieldValue(FieldId.KeyLocation, value),
            }}
          />
        </FormGroup>
      </GridItem>

      <KmsKeyRingSelect />
      <KmsKeySelect />

      <GridItem>
        <TextInputField
          name={FieldId.KmsServiceAccount}
          label="KMS Service Account"
          tooltip={constants.kmsserviceAccount}
          validate={validateGCPKMSServiceAccount}
          helperText="GCP Service account will be used for compute scaling."
        />
      </GridItem>
    </>
  );
};
