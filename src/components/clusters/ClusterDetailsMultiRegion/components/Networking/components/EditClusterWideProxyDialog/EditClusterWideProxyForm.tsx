import React from 'react';
import { Field } from 'formik';
import { isEqual } from 'lodash';

import { Alert, Button, Content, Form, Grid, GridItem } from '@patternfly/react-core';

import { stringToArray } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import {
  checkNoProxyDomains,
  composeValidators,
  validateCA,
  validateUrl,
} from '~/common/validators';
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
import ErrorBox from '~/components/common/ErrorBox';
import ExternalLink from '~/components/common/ExternalLink';
import Modal from '~/components/common/Modal/Modal';
import PopoverHint from '~/components/common/PopoverHint';
import ReduxFileUpload from '~/components/common/ReduxFormComponents_deprecated/ReduxFileUpload';
import ReduxVerticalFormGroup from '~/components/common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';
import { ErrorState } from '~/types/types';

import { ACCEPT, MAX_FILE_SIZE } from '../../../IdentityProvidersPage/components/CAUpload';

const FormFieldId = {
  HttpProxyURL: 'http_proxy_url',
  HttpsProxyURL: 'https_proxy_url',
  NoProxyDomains: 'no_proxy_domains',
  AdditionalTrustBundle: 'additional_trust_bundle',
};

type EditClusterWideProxyFormProps = {
  isClusterEditError: boolean;
  clusterEditError: Pick<ErrorState, 'errorDetails' | 'errorMessage' | 'operationID' | 'message'>;
  isClusterEditPending: boolean;
  submitForm: () => void;
  handleClose: () => void;
};

const EditClusterWideProxyForm = ({
  isClusterEditError,
  clusterEditError,
  isClusterEditPending,
  submitForm,
  handleClose,
}: EditClusterWideProxyFormProps) => {
  const {
    setFieldTouched,
    setFieldValue, // Set value of form field directly
    getFieldProps, // Access: name, value, onBlur, onChange for a <Field>, useful for mapping to a field
    getFieldMeta, // Access: error, touched for a <Field>, useful for mapping to a field
    values: {
      [FormFieldId.HttpProxyURL]: httpProxyUrl,
      [FormFieldId.HttpsProxyURL]: httpsProxyUrl,
      [FormFieldId.AdditionalTrustBundle]: additionalTrustBundle,
    },
    values,
    initialValues,
  } = useFormState();

  const isNotModified = isEqual(values, initialValues);

  const [anyTouched, setAnyTouched] = React.useState(false);

  const [openFileUpload, setOpenFileUpload] = React.useState(!additionalTrustBundle);

  React.useEffect(() => () => setAnyTouched(false), []);

  const noUrlValues = !httpProxyUrl && !httpsProxyUrl;

  const onTouched = () => {
    // this lets us know that one of the fields was touched
    if (!anyTouched) {
      setAnyTouched(true);
    }
  };
  const noValues = () => noUrlValues && !additionalTrustBundle;
  const validateUrlHttp = (value: string) => validateUrl(value, 'http');
  const validateUrlHttps = (value: string) => validateUrl(value, ['http', 'https']);
  const validateAtLeastOne = () => {
    if (!httpProxyUrl && !httpsProxyUrl && !additionalTrustBundle) {
      return 'Configure at least one of the cluster-wide proxy fields.';
    }
    return undefined;
  };

  const atLeastOneAlert = (
    <Alert isInline variant="warning" title="Complete at least 1 of the fields above." />
  );

  React.useEffect(() => {
    if (noUrlValues) {
      setFieldValue(FormFieldId.NoProxyDomains, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noUrlValues]);

  const clusterProxyError = isClusterEditError && (
    <ErrorBox
      message="Error editing cluster-wide proxy"
      response={{
        errorMessage: clusterEditError?.errorMessage || clusterEditError?.message,
        operationID: clusterEditError?.operationID,
      }}
    />
  );

  const uploadTrustBundleField = (
    <Field
      component={ReduxFileUpload}
      name={FormFieldId.AdditionalTrustBundle}
      label="Additional trust bundle"
      placeholder={TRUST_BUNDLE_PLACEHOLDER}
      extendedHelpTitle="Additional trust bundle"
      extendedHelpText="An additional trust bundle is a PEM encoded X.509 certificate bundle that will be added to the nodes' trusted certificate store."
      validate={composeValidators(validateCA, validateAtLeastOne)}
      dropzoneProps={{
        accept: ACCEPT,
        maxSize: MAX_FILE_SIZE,
        onDropRejected: () => setFieldValue(FormFieldId.AdditionalTrustBundle, 'Invalid file'),
      }}
      meta={getFieldMeta('additional_trust_bundle')}
      helpText="Upload or paste a PEM encoded X.509 certificate."
      input={{
        ...getFieldProps(FormFieldId.AdditionalTrustBundle),
        onChange: (value: string) => {
          setFieldValue(FormFieldId.AdditionalTrustBundle, value);
          setTimeout(() => setFieldTouched(FormFieldId.AdditionalTrustBundle), 1);
        },
        onBlur: (event: any) => {
          const { onBlur } = getFieldProps(FormFieldId.AdditionalTrustBundle);
          onTouched();
          onBlur(event);
        },
      }}
    />
  );

  const replaceTrustBundle = (
    <>
      <div className="ocm-c-networking-vpc-details__card pf-v6-c-form__label-text pf-v6-c-form__group-label">
        Additional Trust Bundle{' '}
        <PopoverHint
          headerContent="Additional trust bundle"
          bodyContent={TRUST_BUNDLE_HELPER_TEXT}
        />
      </div>
      <div>
        File Uploaded Successfully{' '}
        <Button
          // opens field to replace addition trust bundle
          onClick={() => {
            setFieldValue(FormFieldId.AdditionalTrustBundle, undefined);
            setOpenFileUpload(true);
          }}
          variant="link"
          isInline
          className="ocm-c-networking-vpc-details__card--replace-button"
        >
          Replace file
        </Button>
      </div>
    </>
  );

  return (
    <Modal
      onClose={handleClose}
      title="Edit cluster-wide Proxy"
      onPrimaryClick={submitForm}
      primaryText="Save"
      isPrimaryDisabled={isNotModified}
      onSecondaryClick={handleClose}
      isPending={isClusterEditPending}
    >
      {clusterProxyError}
      <Form>
        <Grid hasGutter>
          <GridItem>
            <Content component="p">
              Enable an HTTP or HTTPS proxy to deny direct access to the Internet from your cluster
            </Content>
            <Content component="p" className="pf-v6-u-mt-sm">
              <ExternalLink href={links.CONFIGURE_PROXY_URL}>
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

          <GridItem sm={12} md={10} xl2={11}>
            <Field
              component={ReduxVerticalFormGroup}
              name={FormFieldId.HttpProxyURL}
              label="HTTP Proxy URL"
              placeholder={HTTP_PROXY_PLACEHOLDER}
              type="text"
              validate={composeValidators(validateUrlHttp, validateAtLeastOne)}
              helpText="Specify a proxy URL to use for HTTP connections outside the cluster."
              showHelpTextOnError={false}
              meta={getFieldMeta(FormFieldId.HttpProxyURL)}
              input={{
                ...getFieldProps(FormFieldId.HttpProxyURL),
                onChange: (_: React.MouseEvent | React.ChangeEvent, value: string) => {
                  setFieldValue(FormFieldId.HttpProxyURL, value);
                  setTimeout(() => setFieldTouched(FormFieldId.HttpProxyURL), 1);
                },
                onBlur: (event: any) => {
                  const { onBlur } = getFieldProps(FormFieldId.HttpProxyURL);
                  onTouched();
                  onBlur(event);
                },
              }}
            />
          </GridItem>

          <GridItem sm={12} md={10} xl2={11}>
            <Field
              component={ReduxVerticalFormGroup}
              name={FormFieldId.HttpsProxyURL}
              label="HTTPS Proxy URL"
              placeholder={HTTPS_PROXY_PLACEHOLDER}
              type="text"
              validate={composeValidators(validateUrlHttps, validateAtLeastOne)}
              helpText="Specify a proxy URL to use for HTTPS connections outside the cluster."
              showHelpTextOnError={false}
              meta={getFieldMeta(FormFieldId.HttpsProxyURL)}
              input={{
                ...getFieldProps(FormFieldId.HttpsProxyURL),
                onChange: (_: React.MouseEvent | React.ChangeEvent, value: string) => {
                  setFieldValue(FormFieldId.HttpsProxyURL, value);
                  setTimeout(() => setFieldTouched(FormFieldId.HttpsProxyURL), 1);
                },
                onBlur: (event: any) => {
                  const { onBlur } = getFieldProps(FormFieldId.HttpsProxyURL);
                  onTouched();
                  onBlur(event);
                },
              }}
            />
          </GridItem>
          <GridItem sm={12} md={10} xl2={11}>
            <Field
              component={ReduxVerticalFormGroup}
              name={FormFieldId.NoProxyDomains}
              label="No Proxy domains"
              placeholder={noUrlValues ? DISABLED_NO_PROXY_PLACEHOLDER : NO_PROXY_PLACEHOLDER}
              type="text"
              validate={checkNoProxyDomains}
              helpText={NO_PROXY_HELPER_TEXT}
              showHelpTextOnError={false}
              isDisabled={noUrlValues}
              meta={getFieldMeta(FormFieldId.NoProxyDomains)}
              input={{
                ...getFieldProps(FormFieldId.NoProxyDomains),
                onChange: (_: React.MouseEvent | React.ChangeEvent, value: string) => {
                  setFieldValue(FormFieldId.NoProxyDomains, stringToArray(value));
                  setTimeout(() => setFieldTouched(FormFieldId.NoProxyDomains), 1);
                },
                onBlur: (event: any) => {
                  const { onBlur } = getFieldProps(FormFieldId.NoProxyDomains);
                  onTouched();
                  onBlur(event);
                },
              }}
            />
          </GridItem>
          <GridItem sm={12} md={10} xl2={11}>
            {!openFileUpload ? replaceTrustBundle : uploadTrustBundleField}
          </GridItem>
          <GridItem md={2} xl2={4} />
          <GridItem>{anyTouched && noValues() && atLeastOneAlert}</GridItem>
        </Grid>
      </Form>
    </Modal>
  );
};

export default EditClusterWideProxyForm;
