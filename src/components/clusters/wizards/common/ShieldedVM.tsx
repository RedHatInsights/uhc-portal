import React from 'react';

import { FormGroup, GridItem, Split, SplitItem, Tooltip } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

import { constants } from '../../common/CreateOSDFormConstants';
import { CheckboxField } from '../form';
import { FieldId } from '../osd/constants';

type ShieldedVMProps = {
  isEditModal?: boolean;
  showSecureBootAlert?: boolean;
  secureBootAlert?: React.JSX.Element;
  isIncompatibleSecureBootVersion?: boolean;
};

export const ShieldedVM = ({
  isEditModal,
  showSecureBootAlert,
  secureBootAlert,
  isIncompatibleSecureBootVersion,
}: ShieldedVMProps) => {
  const disabledSecureBoot = isEditModal || isIncompatibleSecureBootVersion;

  return (
    <GridItem>
      <FormGroup label="Shielded VM" fieldId={FieldId.SecureBoot}>
        <Split hasGutter className="pf-u-mb-0">
          <SplitItem>
            {disabledSecureBoot ? (
              <Tooltip content="Secure Boot settings can only be modified during machine pool creation and are not editable afterward">
                <CheckboxField
                  name={FieldId.SecureBoot}
                  label="Enable Secure Boot support for Shielded VMs"
                  isDisabled={disabledSecureBoot}
                />
              </Tooltip>
            ) : (
              <CheckboxField
                name={FieldId.SecureBoot}
                label="Enable Secure Boot support for Shielded VMs"
                isDisabled={disabledSecureBoot}
              />
            )}
          </SplitItem>
          <SplitItem>
            <PopoverHint hint={constants.enableSecureBootHint} />
          </SplitItem>
        </Split>
        {showSecureBootAlert && secureBootAlert}
      </FormGroup>
    </GridItem>
  );
};
