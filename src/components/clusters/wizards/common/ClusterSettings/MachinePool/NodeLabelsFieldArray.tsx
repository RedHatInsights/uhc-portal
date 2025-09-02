import React from 'react';
import classNames from 'classnames';
import { FieldArray } from 'formik';

import { Button, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { nodeKeyValueTooltipText } from '~/common/helpers';
import { checkLabelKey, checkLabelValue } from '~/common/validators';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { TextInputField } from '~/components/clusters/wizards/form/TextInputField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import ButtonWithTooltip from '~/components/common/ButtonWithTooltip';

import './NodeLabelsFieldArray.scss';

export interface NodeLabel {
  key: string;
  value: string;
}

export const NodeLabelsFieldArray = () => {
  const { values } = useFormState();
  const nodeLabels: NodeLabel[] = values[FieldId.NodeLabels];
  const hasIncompleteNodeKeys = () => nodeLabels.some((nodeLabel) => !nodeLabel.key);

  const validateNodeKey = (index: number) => (value: string) => {
    if (nodeLabels.length > 1) {
      const nodeLabelKeys = nodeLabels.reduce((acc: string[], nodeLabel, keyIndex) => {
        if (nodeLabel.key && index !== keyIndex) {
          acc.push(nodeLabel.key);
        }
        return acc;
      }, []);

      if (nodeLabelKeys.includes(value)) {
        return 'Each label must have a different key.';
      }
    }
    if (value.length > 0) {
      return checkLabelKey(value);
    }

    return undefined;
  };

  const validateNodeValue = (value: string) => {
    if (value.length > 0) {
      return checkLabelValue(value);
    }

    return undefined;
  };

  return (
    <Stack hasGutter className="label-split-layout">
      <FieldArray
        name={FieldId.NodeLabels}
        validateOnChange
        render={({ push, remove }) => (
          <>
            {nodeLabels?.map((_, index) => {
              const isRemoveDisabled = index === 0 && nodeLabels.length === 1;
              const name = `${FieldId.NodeLabels}.${index}`;
              const keyFieldName = `${name}.key`;
              const valueFieldName = `${name}.value`;

              return (
                <StackItem>
                  <Split hasGutter className="node-label-split-layout">
                    <SplitItem className="node-label-split-item">
                      <TextInputField
                        name={keyFieldName}
                        validate={validateNodeKey(index)}
                        label={index === 0 ? 'Key' : undefined}
                        formGroup={{ isRequired: false }}
                      />
                    </SplitItem>
                    <SplitItem className="node-label-split-item">
                      <TextInputField
                        name={valueFieldName}
                        validate={validateNodeValue}
                        label={index === 0 ? 'Value' : undefined}
                        formGroup={{ isRequired: false }}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        onClick={() => remove(index)}
                        icon={<MinusCircleIcon />}
                        variant="link"
                        isInline
                        isDisabled={isRemoveDisabled}
                        className={`${classNames(
                          isRemoveDisabled && 'pf-v6-u-disabled-color-200',
                        )} ${classNames(
                          index === 0 ? 'label-button-padding-lg' : 'label-button-padding-sm',
                        )}`}
                      />
                    </SplitItem>
                  </Split>
                </StackItem>
              );
            })}
            <StackItem>
              <ButtonWithTooltip
                onClick={() => push({ key: '', value: '' })}
                icon={<PlusCircleIcon />}
                variant="link"
                isInline
                disableReason={hasIncompleteNodeKeys() && nodeKeyValueTooltipText}
              >
                Add additional label
              </ButtonWithTooltip>
            </StackItem>
          </>
        )}
      />
    </Stack>
  );
};
