import React, { useEffect, useMemo, useState } from 'react';

import { Content, ContentVariants, FormGroup, NumberInput } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';

interface PIDsLimitInputProps {
  value?: number;
  minValue: number;
  maxValue: number;
  onChange: (value: number) => void;
  isValid?: boolean;
  validationMessage: string;
  isUnsafe?: boolean;
  safeMaxValue: number;
}
export const PIDsLimitInput: React.FC<PIDsLimitInputProps> = (props) => {
  const {
    value,
    isValid,
    validationMessage,
    isUnsafe,
    minValue,
    maxValue,
    onChange,
    safeMaxValue,
  } = props;
  const [pidsLimit, setPidsLimit] = useState<number | ''>(value ?? '');

  const validation: {
    helperText: string;
    icon: React.ReactNode;
    status: 'warning' | 'error' | 'default';
  } = useMemo(() => {
    if (isUnsafe) {
      return {
        helperText: `Setting a PIDs limit higher than ${safeMaxValue.toLocaleString()} on your cluster could potentially cause your workloads to fail unexpectedly.`,
        icon: <ExclamationTriangleIcon />,
        status: 'warning',
      };
    }
    if (!isValid) {
      return {
        helperText: validationMessage,
        icon: <ExclamationCircleIcon />,
        status: 'error',
      };
    }
    // isValid
    return {
      helperText: `The safe PIDs limit range is ${minValue.toLocaleString()} - ${safeMaxValue.toLocaleString()}`,
      icon: null,
      status: 'default',
    };
  }, [isUnsafe, isValid, minValue, safeMaxValue, validationMessage]);

  const normalizeBetween = (value: number, min: number, max: number) => {
    if (min !== undefined && max !== undefined) {
      return Math.max(Math.min(value, max), min);
    }
    if (value <= min) {
      return min;
    }
    if (value >= max) {
      return max;
    }
    return value;
  };

  const onMinus = () => {
    const newValue = normalizeBetween((pidsLimit as number) - 1, minValue, maxValue);
    setPidsLimit(newValue);
    onChange(newValue);
  };

  const onPlus = () => {
    const newValue = normalizeBetween((pidsLimit as number) + 1, minValue, maxValue);
    setPidsLimit(newValue);
    onChange(newValue);
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { value } = event.target as HTMLInputElement;
    const numberValue = Number(value);
    setPidsLimit(value === '' ? value : numberValue);
    onChange(numberValue);
  };

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const blurVal = Number(event.target.value);

    if (blurVal < minValue) {
      setPidsLimit(minValue);
      onChange(minValue);
    } else if (blurVal > maxValue) {
      setPidsLimit(maxValue);
      onChange(maxValue);
    }
  };

  useEffect(() => {
    if (value) {
      setPidsLimit(value);
    }
  }, [pidsLimit, value]);

  return (
    <FormGroup
      required
      label="Pod process IDs limit (PIDs)"
      labelHelp={
        <PopoverHint
          title="Pod process IDs limit (PIDs)"
          hint={
            <div>
              Process IDs (PIDs) are a fundamental resource on nodes. Openshift allows you to limit
              the number of processes running in a POD.
            </div>
          }
          buttonAriaLabel="More info for PIDs limit field"
        />
      }
      isRequired
      fieldId="pids-limit"
    >
      <Content className="pf-v6-u-mb-md">
        <Content component={ContentVariants.p}>
          Adjusting the PIDs limit will result in all nodes that are not control plane nodes to
          reboot, potentially impacting workload downtime.
        </Content>
      </Content>
      <NumberInput
        id="pids-limit"
        name="pids-limit"
        aria-describedby="pids-limit-helper-text"
        value={pidsLimit}
        min={minValue}
        max={maxValue}
        onMinus={onMinus}
        onChange={handleChange}
        onBlur={onBlur}
        onPlus={onPlus}
        widthChars={12}
        inputName="pids-limit"
        inputAriaLabel="PIDs limit"
        minusBtnAriaLabel="minus"
        plusBtnAriaLabel="plus"
        validated={validation.status}
      />
      <FormGroupHelperText
        id="pids-limit-helper-text"
        variant={validation.status}
        icon={validation.icon}
      >
        {validation.helperText}
      </FormGroupHelperText>
    </FormGroup>
  );
};
