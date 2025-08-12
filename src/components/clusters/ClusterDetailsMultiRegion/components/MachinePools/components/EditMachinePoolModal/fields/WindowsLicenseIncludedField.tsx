import React from 'react';
import { useField } from 'formik';

import { Checkbox, Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { fieldId as instanceTypeFieldId } from '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import WithTooltip from '~/components/common/WithTooltip';
import { MachineType, NodePool } from '~/types/clusters_mgmt.v1';

const fieldId = 'windowsLicenseIncluded';

type WindowsLicenseIncludedFieldProps = {
  isEdit?: boolean;
  // Manually adding this field until backend api adds support to it -> https://issues.redhat.com/browse/OCMUI-2905
  currentMP?: NodePool & { imageType?: string };
};

const {
  WINDOWS_LICENSE_INCLUDED_AWS_DOCS: AWS_DOCS_LINK,
  WINDOWS_LICENSE_INCLUDED_REDHAT_DOCS: REDHAT_DOCS_LINK,
} = links;

const WindowsLicenseIncludedField = ({
  isEdit = false,
  currentMP,
}: WindowsLicenseIncludedFieldProps) => {
  // Windows LI checkbox field:
  const [_field, { value: isChecked }, { setValue: setFieldValue }] = useField(fieldId);

  // Instance type field -> get isWinLiCompatible from the selected instance type:
  const [__field, { value: instanceType }] = useField(instanceTypeFieldId);
  const isWinLiCompatible =
    // Manually adding this field until backend api adds support to it -> https://issues.redhat.com/browse/OCMUI-2905
    (instanceType as MachineType & { features: { winLi: boolean } })?.features?.winLi ?? false;

  const isCurrentMPWinLiEnabled = isEdit && currentMP?.imageType === 'Windows';

  const hint = (
    <PopoverHint
      bodyContent={
        <Content component={ContentVariants.ul} isPlainList>
          <Content component={ContentVariants.li}>
            Learn more about{' '}
            <ExternalLink href={AWS_DOCS_LINK}>Microsoft licensing on AWS</ExternalLink> and{' '}
            <ExternalLink href={REDHAT_DOCS_LINK}>
              how to work with AWS-Windows-LI hosts
            </ExternalLink>
          </Content>
          <Content component={ContentVariants.li}>
            When enabled, the machine pool is AWS License Included for Windows with associated fees.
          </Content>
        </Content>
      }
    />
  );

  return isEdit ? (
    isCurrentMPWinLiEnabled && (
      <Flex>
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <Content component={ContentVariants.p}>This machine pool is Windows LI enabled</Content>
        </FlexItem>
        {hint}
        <FlexItem />
      </Flex>
    )
  ) : (
    <Flex>
      <FlexItem spacer={{ default: 'spacerXs' }}>
        <WithTooltip
          showTooltip={!isWinLiCompatible}
          content="This instance type is not Windows License Included compatible, please see documentation for further details"
        >
          <Checkbox
            isChecked={isChecked}
            onChange={() => {
              setFieldValue(!isChecked);
            }}
            id={fieldId}
            label="Enable machine pool for Windows License Included"
            isDisabled={!isWinLiCompatible}
          />
        </WithTooltip>
      </FlexItem>
      <FlexItem>{hint}</FlexItem>
    </Flex>
  );
};

export { WindowsLicenseIncludedField };
