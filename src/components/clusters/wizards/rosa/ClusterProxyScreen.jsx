import React, { useEffect } from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import {
  Alert,
  AlertActionLink,
  Content,
  Form,
  Grid,
  GridItem,
  Title,
  useWizardContext,
} from '@patternfly/react-core';

import { stringToArray } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import {
  checkNoProxyDomains,
  composeValidators,
  validateCA,
  validateUrl,
} from '~/common/validators';
import {
  ACCEPT,
  MAX_FILE_SIZE,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/IdentityProvidersPage/components/CAUpload';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import {
  DISABLED_NO_PROXY_PLACEHOLDER,
  HTTP_PROXY_PLACEHOLDER,
  HTTPS_PROXY_PLACEHOLDER,
  NO_PROXY_HELPER_TEXT,
  NO_PROXY_PLACEHOLDER,
  TRUST_BUNDLE_HELPER_TEXT,
  TRUST_BUNDLE_PLACEHOLDER,
} from '~/components/clusters/common/networkingConstants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import ReduxFileUpload from '~/components/common/ReduxFormComponents_deprecated/ReduxFileUpload';
import ReduxVerticalFormGroup from '~/components/common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';

function ClusterProxyScreen({ isHypershiftSelected }) {
  const {
    setFieldTouched,
    setFieldValue, // Set value of form field directly
    getFieldProps, // Access: name, value, onBlur, onChange for a <Field>, useful for mapping to a field
    getFieldMeta, // Access: error, touched for a <Field>, useful for mapping to a field
    values: {
      [FieldId.HttpProxyUrl]: httpProxyUrl,
      [FieldId.HttpsProxyUrl]: httpsProxyUrl,
      [FieldId.AdditionalTrustBundle]: additionalTrustBundle,
    },
  } = useFormState();
  const [anyTouched, setAnyTouched] = React.useState(false);
  const { goToStepByName } = useWizardContext();

  const noUrlValues = !httpProxyUrl && !httpsProxyUrl;

  const onTouched = () => {
    // this lets us know that one of the fields was touched
    if (!anyTouched) {
      setAnyTouched(true);
    }
  };
  const noValues = () => noUrlValues && !additionalTrustBundle;
  const validateUrlHttp = (value) => validateUrl(value, 'http');
  const validateUrlHttps = (value) => validateUrl(value, ['http', 'https']);
  const validateAtLeastOne = () => {
    if (!httpProxyUrl && !httpsProxyUrl && !additionalTrustBundle) {
      return 'Configure at least one of the cluster-wide proxy fields.';
    }
    return undefined;
  };

  const atLeastOneAlert = (
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
  );

  const onFileRejected = () => {
    // 'Invalid file' is a magic string that triggers a validation error
    // in src/common/validators.js validateCA function
    setFieldValue(FieldId.AdditionalTrustBundle, 'Invalid file');
  };

  useEffect(() => {
    if (noUrlValues) {
      setFieldValue(FieldId.NoProxyDomains, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noUrlValues]);

  const httpProxyUrlFieldProps = getFieldProps(FieldId.HttpProxyUrl);
  const httpsProxyUrlFieldProps = getFieldProps(FieldId.HttpsProxyUrl);
  const additionalTrustBundleFieldProps = getFieldProps(FieldId.AdditionalTrustBundle);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        return false;
      }}
    >
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">Cluster-wide proxy</Title>
        </GridItem>
        <GridItem>
          <Content component="p">{constants.clusterProxyHint}</Content>
          <Content component="p" className="pf-v6-u-mt-sm">
            <ExternalLink
              href={
                isHypershiftSelected
                  ? links.ROSA_CLUSTER_WIDE_PROXY
                  : links.ROSA_CLASSIC_CLUSTER_WIDE_PROXY
              }
            >
              Learn more about configuring a cluster-wide proxy
            </ExternalLink>
          </Content>
        </GridItem>
        <GridItem>
          <Alert
            variant="info"
            isInline
            isPlain
            title="Configure at least 1 of the following fields:"
          />
        </GridItem>
        <GridItem sm={12} md={10} xl2={8}>
          <Field
            component={ReduxVerticalFormGroup}
            name={FieldId.HttpProxyUrl}
            label="HTTP proxy URL"
            placeholder={HTTP_PROXY_PLACEHOLDER}
            type="text"
            validate={composeValidators(validateUrlHttp, validateAtLeastOne)}
            helpText="Specify a proxy URL to use for HTTP connections outside the cluster."
            showHelpTextOnError={false}
            input={{
              ...httpProxyUrlFieldProps,
              onChange: (_, value) => {
                setFieldValue(FieldId.HttpProxyUrl, value);
                setTimeout(() => setFieldTouched(FieldId.HttpProxyUrl), 1);
              },
              onBlur: (event) => {
                const { onBlur } = httpProxyUrlFieldProps;
                onTouched();
                onBlur(event);
              },
            }}
            meta={getFieldMeta(FieldId.HttpProxyUrl)}
          />
        </GridItem>
        <GridItem sm={0} md={2} xl2={4} />
        <GridItem sm={12} md={10} xl2={8}>
          <Field
            component={ReduxVerticalFormGroup}
            name={FieldId.HttpsProxyUrl}
            label="HTTPS proxy URL"
            placeholder={HTTPS_PROXY_PLACEHOLDER}
            type="text"
            validate={composeValidators(validateUrlHttps, validateAtLeastOne)}
            helpText="Specify a proxy URL to use for HTTPS connections outside the cluster."
            showHelpTextOnError={false}
            input={{
              ...httpsProxyUrlFieldProps,
              onChange: (_, value) => {
                setFieldValue(FieldId.HttpsProxyUrl, value);
                setTimeout(() => setFieldTouched(FieldId.HttpsProxyUrl), 1);
              },
              onBlur: (event) => {
                const { onBlur } = httpsProxyUrlFieldProps;
                onTouched();
                onBlur(event);
              },
            }}
            meta={getFieldMeta(FieldId.HttpsProxyUrl)}
          />
        </GridItem>
        <GridItem sm={0} md={2} xl2={4} />
        <GridItem sm={12} md={10} xl2={8}>
          <Field
            component={ReduxVerticalFormGroup}
            name={FieldId.NoProxyDomains}
            label="No Proxy domains"
            placeholder={noUrlValues ? DISABLED_NO_PROXY_PLACEHOLDER : NO_PROXY_PLACEHOLDER}
            type="text"
            validate={checkNoProxyDomains}
            helpText={NO_PROXY_HELPER_TEXT}
            showHelpTextOnError={false}
            isDisabled={noUrlValues}
            input={{
              ...getFieldProps(FieldId.NoProxyDomains),
              onChange: (_, value) => {
                setFieldValue(FieldId.NoProxyDomains, stringToArray(value));
                setTimeout(() => setFieldTouched(FieldId.NoProxyDomains), 1);
              },
            }}
            meta={getFieldMeta(FieldId.NoProxyDomains)}
          />
        </GridItem>
        <GridItem sm={0} md={2} xl2={4} />
        <GridItem sm={12} md={10} xl2={8}>
          <Field
            component={ReduxFileUpload}
            name={FieldId.AdditionalTrustBundle}
            label="Additional trust bundle"
            placeholder={TRUST_BUNDLE_PLACEHOLDER}
            extendedHelpTitle="Additional trust bundle"
            extendedHelpText={TRUST_BUNDLE_HELPER_TEXT}
            validate={composeValidators(validateCA, validateAtLeastOne)}
            dropzoneProps={{
              accept: ACCEPT,
              maxSize: MAX_FILE_SIZE,
              onDropRejected: onFileRejected,
            }}
            helpText="Upload or paste a PEM encoded X.509 certificate."
            input={{
              ...additionalTrustBundleFieldProps,
              onChange: (value) => {
                setFieldValue(FieldId.AdditionalTrustBundle, value);
                setTimeout(() => setFieldTouched(FieldId.AdditionalTrustBundle), 1);
              },
              onBlur: (event) => {
                const { onBlur } = additionalTrustBundleFieldProps;
                onTouched();
                onBlur(event);
              },
            }}
            meta={getFieldMeta(FieldId.AdditionalTrustBundle)}
          />
        </GridItem>
        <GridItem sm={0} md={2} xl2={4} />
        <GridItem>{anyTouched && noValues() && atLeastOneAlert}</GridItem>
      </Grid>
    </Form>
  );
}

ClusterProxyScreen.propTypes = {
  isHypershiftSelected: PropTypes.bool.isRequired,
};

export default ClusterProxyScreen;
