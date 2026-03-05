import * as React from 'react';
import { useField } from 'formik';

import { Alert, Checkbox, Stack, StackItem } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import WithTooltip from '~/components/common/WithTooltip';

const fieldId = 'useSpotInstances';

type UseSpotInstancesFieldProps = {
  children: React.ReactNode;
  isDisabled: boolean;
};

const UseSpotInstancesField = ({ children, isDisabled }: UseSpotInstancesFieldProps) => {
  const [field] = useField(fieldId);
  return (
    <WithTooltip
      showTooltip={isDisabled}
      content="This option cannot be edited from its original setting selection."
    >
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            {...field}
            label="Use Amazon EC2 Spot Instance"
            isChecked={field.value as boolean}
            onChange={(event, checked) => {
              field.onChange(event);
            }}
            id={fieldId}
            body={field.value && children}
            description="You can save on costs by creating a machine pool running on AWS that deploys machines as non-guaranteed Spot Instances. This cannot be changed after machine pool is created."
            isDisabled={isDisabled}
          />
        </StackItem>
        {field.value && (
          <StackItem>
            <Alert
              variant="warning"
              title="Your Spot Instance may be interrupted at any time. Use Spot Instances for workloads that can tolerate interruptions."
              isInline
            >
              <ExternalLink href={links.AWS_SPOT_INSTANCES}>
                Learn more about Spot instances
              </ExternalLink>
            </Alert>
          </StackItem>
        )}
      </Stack>
    </WithTooltip>
  );
};

export default UseSpotInstancesField;
