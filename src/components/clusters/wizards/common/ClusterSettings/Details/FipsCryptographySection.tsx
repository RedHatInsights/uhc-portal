import React from 'react';

import { FormGroup, GridItem } from '@patternfly/react-core';

import { FieldId } from '~/components/clusters/wizards/common/constants';
import { CheckboxField } from '~/components/clusters/wizards/form/CheckboxField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { CheckboxDescription } from '~/components/common/CheckboxDescription';
import { isRestrictedEnv } from '~/restrictedEnv';

export function FipsCryptographySection() {
  const { getFieldProps, setFieldValue, validateForm } = useFormState();

  return (
    <GridItem>
      <FormGroup label="FIPS cryptography">
        <CheckboxField
          name={FieldId.FipsCryptography}
          label="Enable FIPS cryptography"
          isDisabled={isRestrictedEnv()}
          input={{
            ...getFieldProps(FieldId.FipsCryptography),
            onChange: async (event, checked: boolean) => {
              await setFieldValue(FieldId.FipsCryptography, checked, false);
              if (checked) {
                // force etcd encryption checked
                await setFieldValue(FieldId.EtcdEncryption, true, false);
                // ensure any dependent field's validation is re-triggered (e.g. 'etcd key ARN' of ROSA HCP)
                await validateForm();
              }
            },
          }}
        />
        <CheckboxDescription>
          Install a cluster that uses FIPS Validated / Modules in Process cryptographic libraries on
          the x86_64 architecture.
        </CheckboxDescription>
      </FormGroup>
    </GridItem>
  );
}
