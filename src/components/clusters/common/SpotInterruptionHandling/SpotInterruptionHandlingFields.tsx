import React from 'react';

import {
  Alert,
  Content,
  ContentVariants,
  FormGroup,
  HelperText,
  HelperTextItem,
  Radio,
  Stack,
  StackItem,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';
import WithTooltip from '~/components/common/WithTooltip';

import {
  DEFAULT_SPOT_INTERRUPTION_PREREQ_ALERT,
  ENHANCED_SPOT_DESCRIPTION,
  SIMPLE_SPOT_DESCRIPTION,
  SPOT_INTERRUPTION_INTRO,
  SpotInterruptionMode,
  SQS_QUEUE_URL_HELPER_TEXT,
  SQS_QUEUE_URL_PLACEHOLDER,
} from './spotInterruptionHandlingConstants';

export type SpotInterruptionHandlingFieldsProps = {
  mode: SpotInterruptionMode;
  onModeChange: (mode: SpotInterruptionMode) => void;
  sqsQueueUrl: string;
  onSqsQueueUrlChange: (url: string) => void;
  onSqsQueueUrlBlur?: () => void;
  isEnhancedDisabled?: boolean;
  enhancedDisabledReason?: React.ReactNode;
  sqsQueueUrlValidated?: TextInputProps['validated'];
  sqsQueueUrlHelperText?: React.ReactNode;
  showPrereqAlert?: boolean;
  prereqAlertMessage?: React.ReactNode;
};

export const SpotInterruptionHandlingFields = ({
  mode,
  onModeChange,
  sqsQueueUrl,
  onSqsQueueUrlChange,
  onSqsQueueUrlBlur,
  isEnhancedDisabled = false,
  enhancedDisabledReason,
  sqsQueueUrlValidated = 'default',
  sqsQueueUrlHelperText,
  showPrereqAlert = true,
  prereqAlertMessage = DEFAULT_SPOT_INTERRUPTION_PREREQ_ALERT,
}: SpotInterruptionHandlingFieldsProps) => {
  const isEnhanced = mode === SpotInterruptionMode.Enhanced;

  return (
    <Stack hasGutter>
      <StackItem>
        <Content component={ContentVariants.p}>
          {SPOT_INTERRUPTION_INTRO}{' '}
          <PopoverHint
            buttonAriaLabel="Spot interruption handling information"
            hint="Choose how this cluster responds when AWS reclaims a Spot instance. Simple relies on MachineHealthCheck after interruption. Enhanced uses an SQS queue to drain nodes during the 2-minute interruption window."
          />
        </Content>
      </StackItem>

      <StackItem>
        <Radio
          id="spot-interruption-simple"
          name="spot-interruption-mode"
          label="Simple Spot instances"
          description={SIMPLE_SPOT_DESCRIPTION}
          isChecked={mode === SpotInterruptionMode.Simple}
          onChange={() => onModeChange(SpotInterruptionMode.Simple)}
        />
      </StackItem>

      <StackItem>
        <WithTooltip
          showTooltip={isEnhancedDisabled && !!enhancedDisabledReason}
          content={enhancedDisabledReason}
        >
          <div>
            <Radio
              id="spot-interruption-enhanced"
              name="spot-interruption-mode"
              label="Enhanced Spot instances"
              description={ENHANCED_SPOT_DESCRIPTION}
              isChecked={isEnhanced}
              isDisabled={isEnhancedDisabled}
              onChange={() => onModeChange(SpotInterruptionMode.Enhanced)}
              body={
                isEnhanced ? (
                  <Stack hasGutter>
                    <StackItem>
                      <FormGroup
                        label="SQS queue URL"
                        isRequired
                        fieldId="spot-interruption-sqs-queue-url"
                        labelHelp={
                          <PopoverHint
                            buttonAriaLabel="SQS queue URL information"
                            hint="Amazon SQS queue that receives EC2 Spot Instance interruption notices from EventBridge."
                          />
                        }
                      >
                        <TextInput
                          id="spot-interruption-sqs-queue-url"
                          value={sqsQueueUrl}
                          onChange={(_event, value) => onSqsQueueUrlChange(value)}
                          onBlur={() => {
                            const trimmedValue = sqsQueueUrl.trim();
                            if (trimmedValue !== sqsQueueUrl) {
                              onSqsQueueUrlChange(trimmedValue);
                            }
                            onSqsQueueUrlBlur?.();
                          }}
                          placeholder={SQS_QUEUE_URL_PLACEHOLDER}
                          validated={sqsQueueUrlValidated}
                          isDisabled={isEnhancedDisabled}
                          isRequired
                        />
                        <HelperText>
                          <HelperTextItem
                            variant={sqsQueueUrlValidated === 'error' ? 'error' : 'default'}
                          >
                            {sqsQueueUrlHelperText ?? SQS_QUEUE_URL_HELPER_TEXT}
                          </HelperTextItem>
                        </HelperText>
                      </FormGroup>
                    </StackItem>

                    {showPrereqAlert ? (
                      <StackItem>
                        <Alert variant="info" isInline title={prereqAlertMessage}>
                          {/* TODO https://redhat.atlassian.net/browse/OCMUI-5221 */}
                          {/* <ExternalLink href={}>View setup documentation</ExternalLink> */}
                        </Alert>
                      </StackItem>
                    ) : null}
                  </Stack>
                ) : undefined
              }
            />
          </div>
        </WithTooltip>
      </StackItem>
    </Stack>
  );
};
