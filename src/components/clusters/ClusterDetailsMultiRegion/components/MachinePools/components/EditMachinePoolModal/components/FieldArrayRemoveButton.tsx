import * as React from 'react';

import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';

type FieldArrayRemoveButtonProps = {
  input: {
    value: { key: string; value: string }[];
  };
  index: number;
  onRemove: (index: number) => void;
  onPush: () => void;
  disabled?: boolean;
};

const FieldArrayRemoveButton = ({
  input,
  index,
  onRemove,
  onPush,
  disabled,
}: FieldArrayRemoveButtonProps) => {
  const disableRemove = index === 0 && !input.value[index].key && !input.value[index].value;
  return (
    <Button
      icon={<MinusCircleIcon />}
      onClick={() => {
        const addNew = input.value.length === 1;
        onRemove(index);
        if (addNew) {
          onPush();
        }
      }}
      variant="link"
      isInline
      isDisabled={disableRemove || disabled}
      aria-label="Remove AWS Tag"
    />
  );
};

export default FieldArrayRemoveButton;
