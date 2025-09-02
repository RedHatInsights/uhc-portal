import React from 'react';

import { required, validateGCPServiceAccount } from '~/common/validators';
import { FileUploadField } from '~/components/clusters/wizards/form';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import ExternalLink from '~/components/common/ExternalLink';
import { useGlobalState } from '~/redux/hooks';

const ServiceAccount = () => {
  const { ccsCredentialsValidity } = useGlobalState((state) => state.ccsInquiries);

  return (
    <>
      <FileUploadField
        validate={(value) => required(value) || validateGCPServiceAccount(value)}
        name={FieldId.GcpServiceAccount}
        label="Service account JSON"
        helperText="Upload a JSON file or type to add"
        tooltip={
          <>
            <p>
              To create a service account JSON file, create a key for your service account, export
              it to a file and upload it to this field.
            </p>
            <ExternalLink href="https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys">
              Learn how to create service account keys
            </ExternalLink>
          </>
        }
      />
      <p className="pf-v6-u-mt-md">{ccsCredentialsValidity.pending && 'Validating...'}</p>
    </>
  );
};

export { ServiceAccount };
