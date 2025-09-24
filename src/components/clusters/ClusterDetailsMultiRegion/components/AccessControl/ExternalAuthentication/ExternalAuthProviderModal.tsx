import React from 'react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { getErrorMessage } from '~/common/errors';
import { validateSecureURL } from '~/common/validators';
import ErrorBox from '~/components/common/ErrorBox';
import TextField from '~/components/common/formik/TextField';
import { useAddEditExternalAuth } from '~/queries/ClusterDetailsQueries/AccessControlTab/ExternalAuthenticationQueries/useAddEditExternalAuth';
import { refetchExternalAuths } from '~/queries/ClusterDetailsQueries/AccessControlTab/ExternalAuthenticationQueries/useFetchExternalAuths';
import { ExternalAuth } from '~/types/clusters_mgmt.v1';

import CAUpload from '../../IdentityProvidersPage/components/CAUpload';

type ExternalAuthProviderModalProps = {
  clusterID: string;
  onClose: () => void;
  externalAuthProvider?: ExternalAuth;
  isEdit?: boolean;
  isOpen?: boolean;
  region?: string;
};
type ExternalAuthenticationProvider = {
  id: string;
  issuer: string;
  groups: string;
  username: string;
  provider_ca?: string;
  audiences?: string;
  consoleClientID?: string;
  consoleClientSecret?: string;
};

const modalDescription =
  'An external authentication provider controls access to your cluster. You can add one provider to your cluster.';

const buildExternalAuthProvider = (values: ExternalAuthenticationProvider): ExternalAuth => {
  const consoleCLient = {
    clients: [
      {
        component: {
          name: 'console',
          namespace: 'openshift-console',
        },
        id: values.consoleClientID,
        secret: values.consoleClientSecret,
      },
    ],
  };
  const provider = {
    id: values.id,
    issuer: {
      url: values.issuer,
      audiences: values?.audiences?.split(',').map((audience) => audience.trim()),
      ca: values.provider_ca,
    },
    claim: {
      mappings: {
        username: {
          claim: values.username,
        },
        groups: {
          claim: values.groups,
        },
      },
    },
  };
  return values.consoleClientID && values.consoleClientSecret
    ? { ...provider, ...consoleCLient }
    : provider;
};

export function ExternalAuthProviderModal(props: ExternalAuthProviderModalProps) {
  const { clusterID, onClose, externalAuthProvider, isEdit, region, isOpen = true } = props;

  const {
    isPending,
    isError,
    error: submitError,
    mutate,
  } = useAddEditExternalAuth(clusterID, region);

  const consoleClient = externalAuthProvider?.clients?.find(
    (client) => client.component?.name === 'console',
  );
  return (
    <Formik
      initialValues={{
        id: externalAuthProvider?.id || '',
        issuer: externalAuthProvider?.issuer?.url || '',
        groups: externalAuthProvider?.claim?.mappings?.groups?.claim || 'groups',
        username: externalAuthProvider?.claim?.mappings?.username?.claim || 'email',
        audiences: externalAuthProvider?.issuer?.audiences?.join(', ') || '',
        provider_ca:
          externalAuthProvider?.issuer?.ca?.trim() !== '' ? externalAuthProvider?.issuer?.ca : '',
        consoleClientID: consoleClient?.id || '',
        consoleClientSecret: '',
      }}
      validationSchema={Yup.object().shape(
        {
          id: Yup.string()
            .matches(
              /^[a-z]([-a-z0-9]*[a-z0-9])?$/,
              'Only lowercase alphanumeric characters and hyphens are allowed. Value must start with a letter and end with an alphanumeric.',
            )
            .max(15, 'Must be 15 characters or less')
            .required('Required'),
          issuer: Yup.string()
            .max(255, 'Must be 255 characters or less')
            .required('Required')
            .url('Invalid URL: example https://redhat.com')
            .test('secure-url', 'URL must be https', (value) => validateSecureURL(value)),
          groups: Yup.string()
            .matches(/^[a-zA-Z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed')
            .required('Required'),
          username: Yup.string()
            .matches(/^[a-zA-Z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed')
            .required('Required'),
          audiences: Yup.string().required('Required'),
          consoleClientID: Yup.string()
            .when('consoleClientSecret', {
              is: (consoleClientSecret: string) => consoleClientSecret,
              then(schema) {
                return schema.required('Client ID is required when client secret is provided');
              },
              otherwise(schema) {
                return schema;
              },
            })
            .test(
              'is-member-of-audience',
              'Client ID must be a member of the audiences',
              (value, context) =>
                value
                  ? context.parent.audiences
                      ?.split(',')
                      .map((aud: string) => aud.trim())
                      .includes(value || '')
                  : true,
            ),
          consoleClientSecret: Yup.string().when('consoleClientID', {
            is: (consoleClientID: string) =>
              consoleClientID && consoleClient?.id !== consoleClientID,
            then(schema) {
              return schema.required('Client secret is required when client ID is provided');
            },
            otherwise(schema) {
              return schema;
            },
          }),
        },
        [['consoleClientID', 'consoleClientSecret']],
      )}
      onSubmit={async (values) => {
        const data: ExternalAuth = buildExternalAuthProvider(values);
        mutate(
          {
            values: data,
            externalAuthProviderId: externalAuthProvider?.id,
          },
          {
            onSuccess: () => {
              refetchExternalAuths();
              onClose();
            },
          },
        );
      }}
    >
      {(formik) => (
        <Modal
          id="edit-ext-auth-provider-modal"
          onClose={onClose}
          variant={ModalVariant.medium}
          isOpen={isOpen}
          aria-labelledby="edit-ext-auth-provider-modal"
          aria-describedby="modal-box-edit-ext-auth-provider"
        >
          <ModalHeader
            title={
              isEdit
                ? `Edit provider ${externalAuthProvider?.id}`
                : 'Add external authentication provider'
            }
            description={!isEdit ? modalDescription : undefined}
            labelId="edit-ext-auth-provider-modal"
          />
          <ModalBody>
            <Form>
              {!isEdit && <TextField fieldId="id" label="Name" isRequired />}
              <TextField fieldId="issuer" label="Issuer URL" isRequired />
              <TextField
                fieldId="audiences"
                label="Audiences"
                isRequired
                helpText="The audience IDs that this authentication provider issues tokens for. Use commas to separate multiple audiences."
              />
              <TextField fieldId="groups" label="Groups mapping" isRequired />
              <TextField fieldId="username" label="Username mapping" isRequired />
              <TextField
                fieldId="consoleClientID"
                label="Console client ID"
                helpText="The console identifier of the OIDC client from the OIDC provider. Once set, a client ID can be modified by not removed."
              />
              <TextField
                fieldId="consoleClientSecret"
                label="Console client secret"
                helpText="The console secret of the OIDC client from the OIDC provider."
                placeHolderText={
                  consoleClient?.id && formik.values.consoleClientID === consoleClient?.id
                    ? 'Secret not displayed'
                    : ''
                }
              />
              <Field
                component={CAUpload}
                onChange={(value: string) => formik.setFieldValue('provider_ca', value)}
                input={{
                  name: 'provider_ca',
                  value: formik.values.provider_ca,
                  onChange: (value: string) => formik.setFieldValue('provider_ca', value),
                  onBlur: formik.handleBlur,
                }}
                fieldName="provider_ca"
                name="provider_ca"
                label="CA file"
                helpText="PEM encoded certificate bundle to use to validate server certificates for the configured issuer URL."
                certValue={isEdit ? formik.values.provider_ca : ''}
              />
            </Form>
            {isError && (
              <Stack hasGutter>
                <StackItem>
                  <ErrorBox
                    message={isEdit ? 'Error editing provider' : 'Error adding provider'}
                    response={{
                      errorDetails: submitError.error.errorDetails,
                      errorMessage: getErrorMessage({ payload: submitError.error as any }),
                      operationID: submitError.error.operationID,
                    }}
                  />
                </StackItem>
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              key="add-ext-auth-provider"
              variant="primary"
              isDisabled={isPending}
              isLoading={isPending}
              onClick={formik.submitForm}
            >
              {isEdit ? 'Save' : 'Add'}
            </Button>
            <Button key="cancel" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Formik>
  );
}
