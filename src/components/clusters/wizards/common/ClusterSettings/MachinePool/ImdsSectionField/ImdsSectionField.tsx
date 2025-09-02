import React from 'react';
import { Field } from 'formik';

import { FormGroup } from '@patternfly/react-core';

import { canSelectImds, FieldId, IMDSType } from '~/components/clusters/wizards/common/constants';
import RadioButtons from '~/components/common/ReduxFormComponents_deprecated/RadioButtons';

import { useFormState } from '../../../../hooks';

import { imdsOptions } from './imdsOptions';
import { ImdsSectionAlert } from './ImdsSectionAlert';
import { ImdsSectionHint } from './ImdsSectionHint';

export const ImdsSectionField = () => {
  const {
    values: { [FieldId.ClusterVersion]: clusterVersion, [FieldId.IMDS]: imds },
    getFieldProps,
    setFieldValue,
  } = useFormState();

  const isDisabled = clusterVersion && !canSelectImds(clusterVersion.raw_id);

  const onChange = (value: IMDSType) => {
    setFieldValue(FieldId.IMDS, value);
  };

  React.useEffect(() => {
    if (isDisabled && imds !== IMDSType.V1AndV2) {
      // The user can go back and change the cluster version
      onChange(IMDSType.V1AndV2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled, imds]);

  return (
    <FormGroup label="Instance Metadata Service" fieldId="imds" labelHelp={<ImdsSectionHint />}>
      {isDisabled ? (
        <ImdsSectionAlert />
      ) : (
        <Field
          component={RadioButtons}
          name="imds"
          id="imds"
          ariaLabel="Instance Metadata Service"
          isDisabled={isDisabled}
          className="pf-v6-u-mb-md"
          input={{
            ...getFieldProps(FieldId.IMDS),
            onChange,
          }}
          options={imdsOptions}
          disableDefaultValueHandling // To prevent initial onChange with 'undefined' value
        />
      )}
    </FormGroup>
  );
};
