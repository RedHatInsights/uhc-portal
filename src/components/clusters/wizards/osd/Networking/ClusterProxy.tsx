import React from 'react';

import {
  Alert,
  AlertActionLink,
  Content,
  Flex,
  Form,
  Grid,
  GridItem,
  Title,
  useWizardContext,
} from '@patternfly/react-core';

import { stringToArray } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import { checkNoProxyDomains, validateCA, validateUrl } from '~/common/validators';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import {
  DISABLED_NO_PROXY_PLACEHOLDER,
  HTTP_PROXY_PLACEHOLDER,
  HTTPS_PROXY_PLACEHOLDER,
  NO_PROXY_HELPER_TEXT,
  NO_PROXY_PLACEHOLDER,
  TRUST_BUNDLE_PLACEHOLDER,
} from '~/components/clusters/common/networkingConstants';
import { FileUploadField, TextInputField } from '~/components/clusters/wizards/form';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId, StepName } from '~/components/clusters/wizards/osd/constants';
import ExternalLink from '~/components/common/ExternalLink';

export const MAX_FILE_SIZE = 4000000; // 4MB
export const ACCEPT = {
  'text/plain': ['.pem', '.crt', '.ca', '.cert'],
  'application/x-pem-file': ['.pem'],
  'application/x-x509-ca-cert': ['.crt', '.ca', '.cert'],
};

export const ClusterProxy = () => {
  const {
    values: {
      [FieldId.HttpProxyUrl]: httpProxyUrl,
      [FieldId.HttpsProxyUrl]: httpsProxyUrl,
      [FieldId.AdditionalTrustBundle]: additionalTrustBundle,
      [FieldId.NoProxyDomains]: noProxyDomains,
    },
    touched,
    setFieldValue,
    setFieldTouched,
  } = useFormState();
  const { activeStep, goToStepByName } = useWizardContext();
  const noValues = !httpProxyUrl && !httpsProxyUrl && !additionalTrustBundle;
  const validateAtLeastOne =
    activeStep.name === StepName.ClusterProxy && noValues
      ? 'Configure at least one of the cluster-wide proxy fields.'
      : undefined;
  const showAlert =
    (touched[FieldId.HttpProxyUrl] ||
      touched[FieldId.HttpsProxyUrl] ||
      touched[FieldId.AdditionalTrustBundle]) &&
    noValues;

  const validateHttpProxyUrl = (value: string) => validateUrl(value, 'http') || validateAtLeastOne;
  const validateHttpsProxyUrl = (value: string) =>
    validateUrl(value, ['http', 'https']) || validateAtLeastOne;
  const validateAdditionalTrustBundle = (value: string) => validateCA(value) || validateAtLeastOne;

  React.useEffect(() => {
    if (noProxyDomains && !httpProxyUrl && !httpsProxyUrl) {
      setFieldValue(FieldId.NoProxyDomains, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noProxyDomains, httpProxyUrl, httpsProxyUrl]);

  return (
    <Form>
      <GridItem>
        <Title headingLevel="h3">Cluster-wide proxy</Title>
        <Content component="p" className="pf-v6-u-mt-sm">
          {constants.clusterProxyHint}
        </Content>
        <ExternalLink href={links.OSD_CLUSTER_WIDE_PROXY}>
          Learn more about configuring a cluster-wide proxy
        </ExternalLink>
      </GridItem>

      <GridItem>
        <Alert
          variant="info"
          isInline
          isPlain
          title="Configure at least 1 of the following fields:"
        />
      </GridItem>

      <Grid hasGutter md={6}>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
          <GridItem>
            <TextInputField
              name={FieldId.HttpProxyUrl}
              label="HTTP proxy URL"
              validate={validateHttpProxyUrl}
              helperText="Specify a proxy URL to use for HTTP connections outside the cluster."
              input={{ placeholder: HTTP_PROXY_PLACEHOLDER }}
            />
          </GridItem>

          <GridItem>
            <TextInputField
              name={FieldId.HttpsProxyUrl}
              label="HTTPS proxy URL"
              validate={validateHttpsProxyUrl}
              helperText="Specify a proxy URL to use for HTTPS connections outside the cluster."
              input={{ placeholder: HTTPS_PROXY_PLACEHOLDER }}
            />
          </GridItem>

          <GridItem>
            <TextInputField
              name={FieldId.NoProxyDomains}
              label="No Proxy domains"
              validate={checkNoProxyDomains}
              helperText={NO_PROXY_HELPER_TEXT}
              isDisabled={!httpProxyUrl && !httpsProxyUrl}
              input={{
                onChange: (_, value: string) =>
                  setFieldValue(FieldId.NoProxyDomains, stringToArray(value)),
                placeholder:
                  !httpProxyUrl && !httpsProxyUrl
                    ? DISABLED_NO_PROXY_PLACEHOLDER
                    : NO_PROXY_PLACEHOLDER,
              }}
            />
          </GridItem>

          <GridItem>
            <FileUploadField
              name={FieldId.AdditionalTrustBundle}
              label="Additional trust bundle"
              tooltip={
                <>
                  <Title headingLevel="h6" className="pf-v6-u-mb-sm">
                    Additional trust bundle
                  </Title>
                  <p>
                    An additional trust bundle is a PEM encoded X.509 certificate bundle that will
                    be added to the nodes&apos; trusted certificate store.
                  </p>
                </>
              }
              validate={validateAdditionalTrustBundle}
              helperText="Upload or paste a PEM encoded X.509 certificate."
              input={{
                textAreaPlaceholder: TRUST_BUNDLE_PLACEHOLDER,
                dropzoneProps: {
                  accept: ACCEPT,
                  maxSize: MAX_FILE_SIZE,
                  onDropRejected: () => {
                    setFieldTouched(FieldId.AdditionalTrustBundle, true);
                    setFieldValue(FieldId.AdditionalTrustBundle, 'Invalid file');
                  },
                },
              }}
            />
          </GridItem>

          <GridItem>
            {showAlert && (
              <Alert
                isInline
                variant="warning"
                title={
                  <span>
                    {
                      "Complete at least 1 of the fields above. If you don't want to set a cluster-wide proxy, disable this option in the "
                    }
                    <strong style={{ fontSize: 'var(--pf-t--global--font--size--md)' }}>
                      {'Networking > Configuration'}
                    </strong>
                    {' step.'}
                  </span>
                }
                actionLinks={
                  <AlertActionLink onClick={() => goToStepByName('Configuration')}>
                    Back to the networking configuration
                  </AlertActionLink>
                }
              />
            )}
          </GridItem>
        </Flex>
      </Grid>
    </Form>
  );
};
