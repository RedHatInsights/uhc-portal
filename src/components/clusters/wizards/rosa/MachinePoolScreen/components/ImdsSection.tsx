import React from 'react';
import { Field } from 'formik';

import { FormGroup } from '@patternfly/react-core';

import { IMDSType } from '~/components/clusters/wizards/common';
import {
  imdsOptions,
  ImdsOptionType,
} from '~/components/clusters/wizards/common/ClusterSettings/MachinePool/ImdsSectionField/imdsOptions';
import { ImdsSectionAlert } from '~/components/clusters/wizards/common/ClusterSettings/MachinePool/ImdsSectionField/ImdsSectionAlert';
import { ImdsSectionHint } from '~/components/clusters/wizards/common/ClusterSettings/MachinePool/ImdsSectionField/ImdsSectionHint';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import RadioButtons from '~/components/common/ReduxFormComponents_deprecated/RadioButtons';

type ImdsSectionProps = {
  isDisabled: boolean;
  onChangeImds: (value: IMDSType) => void;
  imds: IMDSType;
};

const ImdsSection = ({ isDisabled, onChangeImds, imds }: ImdsSectionProps) => {
  const { setFieldValue, getFieldProps } = useFormState();

  React.useEffect(() => {
    if (isDisabled && imds !== IMDSType.V1AndV2) {
      // The user can go back and change the cluster version
      onChangeImds(IMDSType.V1AndV2);
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
          name={FieldId.IMDS}
          ariaLabel="Instance Metadata Service"
          isDisabled={isDisabled}
          className="pf-v6-u-mb-md"
          options={imdsOptions}
          disableDefaultValueHandling
          input={{
            ...getFieldProps(FieldId.IMDS),
            onChange: (value: ImdsOptionType) => setFieldValue(FieldId.IMDS, value, false),
          }}
        />
      )}
    </FormGroup>
  );
};

export default ImdsSection;
