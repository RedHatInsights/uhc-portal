import React from 'react';

import { Alert, FormGroup, GridItem, Split, SplitItem } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { validateAWSKMSKeyARN } from '~/common/validators';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { TextInputField } from '~/components/clusters/wizards/form';
import { CheckboxField } from '~/components/clusters/wizards/form/CheckboxField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';

export function HCPEtcdEncryptionSection() {
  const {
    values: {
      [FieldId.EtcdEncryption]: etcdEncryption,
      [FieldId.EtcdKeyArn]: etcdKeyArn,
      [FieldId.Region]: region,
    },
    setFieldValue,
  } = useFormState();

  React.useEffect(() => {
    if (!etcdEncryption && !!etcdKeyArn) {
      setFieldValue(FieldId.EtcdKeyArn, '');
    }
  }, [etcdEncryption, etcdKeyArn, setFieldValue]);

  return (
    <>
      <GridItem>
        <FormGroup label="etcd encryption">
          <Split hasGutter>
            <SplitItem>
              <CheckboxField
                name={FieldId.EtcdEncryption}
                label="Encrypt etcd with a custom KMS key"
              />
            </SplitItem>
            <SplitItem>
              <PopoverHint
                hint={
                  <>
                    {constants.enableAdditionalEtcdHypershiftHint}{' '}
                    <ExternalLink href={links.ROSA_SERVICE_ETCD_ENCRYPTION}>
                      Learn more about etcd encryption
                    </ExternalLink>
                  </>
                }
              />
            </SplitItem>
          </Split>
          <div className="ocm-c--reduxcheckbox-description">
            Etcd is always encrypted, but you can specify a custom KMS key if desired.
          </div>
        </FormGroup>
      </GridItem>

      {etcdEncryption ? (
        <>
          <GridItem>
            <TextInputField
              name={FieldId.EtcdKeyArn}
              label="Key ARN"
              validate={(value) => validateAWSKMSKeyARN(value, region)}
              helperText={!etcdKeyArn ? 'Provide a custom key ARN' : ''}
              tooltip={
                <>
                  <p className="pf-v6-u-mb-sm">{constants.awsKeyARN}</p>
                  <ExternalLink href={links.AWS_FINDING_KEY_ARN}>
                    Finding the key ID and ARN
                  </ExternalLink>
                </>
              }
            />
          </GridItem>

          <GridItem>
            <Alert
              className="pf-v6-u-mt-sm"
              isInline
              isLiveRegion
              variant="info"
              title="If you delete the ARN key, the cluster will no longer be available."
            />
          </GridItem>
        </>
      ) : null}
    </>
  );
}
