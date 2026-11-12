import * as React from 'react';
import { FieldArray, useField } from 'formik';

import {
  Alert,
  AlertVariant,
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  Tooltip,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import {
  AwsTagRow,
  ReadOnlyAwsTag,
  SYSTEM_TAG_REASON,
} from '~/components/clusters/common/awsTags/awsTagsHelpers';
import ButtonWithTooltip from '~/components/common/ButtonWithTooltip';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import TextField from '~/components/common/formik/TextField';

import FieldArrayRemoveButton from '../components/FieldArrayRemoveButton';

import './EditLabelsSection.scss';

// TODO set this to a real number once there is an accurate max number of tags
export const AWS_TAG_MAX_COUNT = Infinity; // only exported for testing

const inheritedTagMessage =
  'Inherited from the cluster. Change the value to override it for this machine pool.';
const inheritedTagRemoveReason =
  "Inherited tags can't be removed from a machine pool. Remove them from the cluster instead.";
const overriddenTagRemoveMessage = 'Remove the override and use the cluster value.';
const getOverriddenTagMessage = (inheritedValue: string) =>
  `Overrides the cluster value "${inheritedValue}". Remove the override to use the cluster value.`;

/** Read-only key field for a cluster tag, with an info icon whose tooltip explains the inheritance. */
const InheritedKeyField = ({ keyField, message }: { keyField: string; message: string }) => {
  // Shown while hovering anywhere on the field or focusing the icon, but always anchored to the icon
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);
  const showTooltip = () => setIsTooltipVisible(true);
  const hideTooltip = () => setIsTooltipVisible(false);

  return (
    <div onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      <TextField
        fieldId={keyField}
        isReadOnly
        ariaLabelledBy="awsTags-key-label"
        customIcon={
          <Tooltip content={message} trigger="manual" isVisible={isTooltipVisible}>
            <Button
              variant="plain"
              hasNoPadding
              className="uhc-aws-tags__inherited-icon"
              icon={<InfoCircleIcon />}
              aria-label="Inherited AWS tag information"
              onFocus={showTooltip}
              onBlur={hideTooltip}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  hideTooltip();
                }
              }}
            />
          </Tooltip>
        }
      />
    </div>
  );
};

/**
 * A key/value row. Cluster tags have a locked key, and removing an override resets the value
 * to the cluster value instead of deleting the row.
 */
const AWSTagRow = ({
  index,
  disabled,
  input,
  onRemove,
  onPush,
}: {
  index: number;
  disabled: boolean;
  input: ReturnType<typeof useField<AwsTagRow[]>>[0];
  onRemove: (index: number) => void;
  onPush: () => void;
}) => {
  const keyField = `awsTags[${index}].key`;
  const valueField = `awsTags[${index}].value`;
  const [keyInput] = useField<string>(keyField);
  const [valueInput, , valueHelpers] = useField<string>(valueField);
  // Cluster tags: the key is locked, and removing an override restores the cluster value
  const { inheritedValue } = input.value[index];
  const isInherited = inheritedValue !== undefined;
  const isOverridden = isInherited && valueInput.value !== inheritedValue;

  let removeButton: React.ReactNode;
  if (isOverridden && !disabled) {
    removeButton = (
      <Tooltip content={overriddenTagRemoveMessage}>
        <Button
          icon={<MinusCircleIcon />}
          variant="link"
          isInline
          aria-label="Remove AWS tag"
          onClick={() => valueHelpers.setValue(inheritedValue)}
        />
      </Tooltip>
    );
  } else if (isInherited && !disabled) {
    removeButton = (
      <ButtonWithTooltip
        icon={<MinusCircleIcon />}
        variant="link"
        isInline
        aria-label="Remove AWS tag"
        disableReason={inheritedTagRemoveReason}
      />
    );
  } else {
    removeButton = (
      <FieldArrayRemoveButton
        input={input}
        index={index}
        onRemove={onRemove}
        onPush={onPush}
        disabled={disabled}
        ariaLabel="Remove AWS tag"
      />
    );
  }

  return (
    <>
      <GridItem span={4}>
        {isInherited && !disabled ? (
          <InheritedKeyField
            keyField={keyField}
            message={isOverridden ? getOverriddenTagMessage(inheritedValue) : inheritedTagMessage}
          />
        ) : (
          <TextField fieldId={keyField} isReadOnly={disabled} ariaLabelledBy="awsTags-key-label" />
        )}
      </GridItem>
      <GridItem span={4}>
        <TextField
          fieldId={valueField}
          isReadOnly={disabled}
          ariaLabelledBy="awsTags-value-label"
          shouldShowError={!disabled && !!keyInput.value}
        />
      </GridItem>
      <GridItem span={4}>{removeButton}</GridItem>
    </>
  );
};

const readOnlyTagHints: Record<string, string> = {
  [SYSTEM_TAG_REASON]: 'These tags are applied by Red Hat and cannot be edited or removed.',
};

/** Lists tags that cannot be edited here (e.g. managed by Red Hat), grouped by reason. */
const ReadOnlyAWSTags = ({ readOnlyTags }: { readOnlyTags: ReadOnlyAwsTag[] }) => {
  const reasons = [...new Set(readOnlyTags.map(({ reason }) => reason))];
  return (
    <>
      {reasons.map((reason) => (
        <GridItem span={12} key={reason}>
          <Content
            component={ContentVariants.small}
            className={`pf-v6-u-font-weight-bold${readOnlyTagHints[reason] ? ' pf-v6-u-mb-0' : ''}`}
          >
            {reason}
          </Content>
          {readOnlyTagHints[reason] ? (
            <Content component={ContentVariants.small} className="pf-v6-u-text-color-subtle">
              <InfoCircleIcon className="pf-v6-u-mr-xs" /> {readOnlyTagHints[reason]}
            </Content>
          ) : null}
          <LabelGroup numLabels={10} isCompact aria-label={`${reason} AWS tags`}>
            {readOnlyTags
              .filter((tag) => tag.reason === reason)
              .map(({ key, value }) => (
                <Label key={key} isCompact>
                  {key}={value}
                </Label>
              ))}
          </LabelGroup>
        </GridItem>
      ))}
    </>
  );
};

type EditAWSTagsSectionProps = {
  isDisabled?: boolean;
  disabledReason?: string;
  readOnlyTags?: ReadOnlyAwsTag[];
  maxCount?: number;
  description?: string;
};

/** Editable list of AWS tags, shared by the machine pool modal and the cluster AWS tags modal. */
const EditAWSTagsSection = ({
  isDisabled = false,
  disabledReason,
  readOnlyTags = [],
  maxCount = AWS_TAG_MAX_COUNT,
  description = "AWS tags are attached to AWS resources to provide metadata, letting you organize, manage, and identify resources. AWS tags added here only apply to the AWS resources created for this machine pool, such as its EC2 instances. To tag all resources in the cluster, edit the AWS tags on the cluster's Overview tab.",
}: EditAWSTagsSectionProps) => {
  const [input] = useField<AwsTagRow[]>('awsTags');

  const tooManyAwsTags = input.value.length >= maxCount;

  let disableReason: string | undefined;
  if (isDisabled) {
    disableReason = disabledReason;
  } else if (tooManyAwsTags) {
    disableReason = `You have reached the maximum number of AWS tags of ${maxCount}`;
  }

  return (
    <GridItem>
      <FormGroup fieldId="awsTags" label="AWS tags">
        <FormGroupHelperText>
          <div className="uhc-labels-section__description">{description}</div>
        </FormGroupHelperText>
      </FormGroup>

      <FieldArray
        name="awsTags"
        render={({ push, remove }) => (
          <>
            <Grid hasGutter>
              {isDisabled && disabledReason ? (
                <GridItem span={12}>
                  <Alert variant={AlertVariant.warning} isInline isPlain title={disabledReason} />
                </GridItem>
              ) : null}
              {readOnlyTags.length > 0 ? <ReadOnlyAWSTags readOnlyTags={readOnlyTags} /> : null}
              <GridItem span={4}>
                <Content component={ContentVariants.small} id="awsTags-key-label">
                  Key
                </Content>
              </GridItem>
              <GridItem span={8}>
                <Content component={ContentVariants.small} id="awsTags-value-label">
                  Value
                </Content>
              </GridItem>
            </Grid>
            <Grid hasGutter>
              {input.value.map((_, index) => (
                <AWSTagRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  index={index}
                  disabled={isDisabled}
                  input={input}
                  onRemove={remove}
                  onPush={() => push({ key: '', value: '' })}
                />
              ))}
              <GridItem span={6}>
                <ButtonWithTooltip
                  icon={<PlusCircleIcon />}
                  onClick={() => push({ key: '', value: '' })}
                  variant="link"
                  isInline
                  isAriaDisabled={isDisabled || tooManyAwsTags}
                  disableReason={disableReason}
                >
                  Add AWS tag
                </ButtonWithTooltip>
              </GridItem>
            </Grid>
          </>
        )}
      />
    </GridItem>
  );
};

export default EditAWSTagsSection;
