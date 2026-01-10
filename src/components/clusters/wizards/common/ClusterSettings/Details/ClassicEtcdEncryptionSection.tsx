import React from 'react';

import {
  FormGroup,
  FormHelperText,
  GridItem,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { CheckboxField } from '~/components/clusters/wizards/form/CheckboxField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { CheckboxDescription } from '~/components/common/CheckboxDescription';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';

type ClassicEtcdEncryptionSectionProps = {
  learnMoreLink?: string;
};

export function ClassicEtcdEncryptionSection({
  learnMoreLink = links.ROSA_SERVICE_ETCD_ENCRYPTION,
}: ClassicEtcdEncryptionSectionProps) {
  const {
    values: { [FieldId.FipsCryptography]: fipsCryptography },
  } = useFormState();

  return (
    <GridItem>
      <FormGroup label="etcd encryption">
        <Split hasGutter>
          <SplitItem>
            <CheckboxField
              name={FieldId.EtcdEncryption}
              label="Enable additional etcd encryption"
              isDisabled={fipsCryptography}
            />
          </SplitItem>
          <SplitItem>
            <PopoverHint
              hint={
                <>
                  {constants.enableAdditionalEtcdHint}{' '}
                  <ExternalLink href={learnMoreLink}>Learn more about etcd encryption</ExternalLink>
                </>
              }
            />
          </SplitItem>
        </Split>
        <CheckboxDescription>
          Add more encryption for OpenShift and Kubernetes API resources.
        </CheckboxDescription>
        {fipsCryptography && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem>Required when FIPS cryptography is enabled</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    </GridItem>
  );
}
