import * as React from 'react';
import { useField } from 'formik';

import { Alert, Checkbox, Stack, StackItem } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import WithTooltip from '~/components/common/WithTooltip';

const fieldId = 'useSpotInstances';

type UseSpotInstancesFieldProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  isDisabled: boolean;
  disabledReason?: string;
};

const UseSpotInstancesField = ({
  children,
  footer,
  isDisabled,
  disabledReason,
}: UseSpotInstancesFieldProps) => {
  const [field] = useField(fieldId);
  const tooltipContent =
    disabledReason || 'This option cannot be edited from its original setting selection.';

  return (
    <Stack hasGutter>
      <StackItem>
        <WithTooltip showTooltip={isDisabled} content={tooltipContent} position="top-start">
          <span className="pf-v6-u-display-inline-block">
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
          </span>
        </WithTooltip>
      </StackItem>
      {field.value ? (
        <StackItem>
          <Alert
            variant="warning"
            title="Your Spot Instance may be interrupted at any time. Use Spot Instances for workloads that can tolerate interruptions."
            isInline
          >
            <ExternalLink href={docLinks.AWS_SPOT_INSTANCES}>
              Learn more about Spot instances
            </ExternalLink>
          </Alert>
          {footer}
        </StackItem>
      ) : null}
    </Stack>
  );
};

export default UseSpotInstancesField;
