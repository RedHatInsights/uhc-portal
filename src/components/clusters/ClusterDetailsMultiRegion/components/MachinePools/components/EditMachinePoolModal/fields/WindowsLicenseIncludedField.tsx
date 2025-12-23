import React from 'react';
import { useFormikContext } from 'formik';

import { Content, ContentVariants } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { CheckboxField } from '~/components/clusters/wizards/form';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { NodePool } from '~/types/clusters_mgmt.v1';
import { ImageType } from '~/types/clusters_mgmt.v1/enums';

import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

const fieldId = 'isWindowsLicenseIncluded';

type WindowsLicenseIncludedFieldProps = {
  isEdit?: boolean;
  currentMP?: NodePool;
};

const {
  WINDOWS_LICENSE_INCLUDED_AWS_DOCS: AWS_DOCS_LINK,
  WINDOWS_LICENSE_INCLUDED_REDHAT_DOCS: REDHAT_DOCS_LINK,
} = links;

const WindowsLicenseIncludedField = ({
  isEdit = false,
  currentMP,
}: WindowsLicenseIncludedFieldProps) => {
  // Instance type field -> get isWinLiCompatible from the selected instance type:
  const { values } = useFormikContext<EditMachinePoolValues>();
  const isWinLiCompatible = !!values.instanceType?.features?.win_li;

  const isCurrentMPWinLiEnabled = isEdit && currentMP?.image_type === ImageType.Windows;

  const hint = (
    <>
      <Content component={ContentVariants.p}>
        Learn more about{' '}
        <ExternalLink href={AWS_DOCS_LINK}>Microsoft licensing on AWS</ExternalLink> and{' '}
        <ExternalLink href={REDHAT_DOCS_LINK}>how to work with AWS-Windows-LI hosts</ExternalLink>
      </Content>
      <Content component={ContentVariants.p}>
        When enabled, the machine pool is AWS License Included for Windows with associated fees.
      </Content>
    </>
  );

  const isDisabled = !isWinLiCompatible;

  if (!isWinLiCompatible) {
    values.isWindowsLicenseIncluded = false;
  }

  return isEdit ? (
    isCurrentMPWinLiEnabled && (
      <Content component={ContentVariants.p} className="pf-v6-u-mt-sm">
        This machine pool is Windows LI enabled <PopoverHint hint={hint} />
      </Content>
    )
  ) : (
    <CheckboxField
      name={fieldId}
      label="Enable machine pool for Windows License Included"
      isDisabled={isDisabled}
      hint={hint}
      showTooltip={isDisabled}
      tooltip="This instance type is not Windows License Included compatible."
      input={isDisabled ? { isChecked: false } : undefined}
    />
  );
};

export { WindowsLicenseIncludedField };
