import React from 'react';
import { Field, FormikValues, useFormikContext } from 'formik';
import { get } from 'lodash';

import { Alert, Form, FormGroup, Grid, GridItem } from '@patternfly/react-core';

import { useGlobalState } from '~/redux/hooks';

import LoadBalancersDropdown from '../LoadBalancersDropdown';
import PersistentStorageDropdown from '../PersistentStorageDropdown';

import { shouldShowLoadBalancerAlert, shouldShowStorageQuotaAlert } from './ScaleClusterSelectors';

type ScaleClusterFormProps = {
  submitForm: (() => Promise<void>) & (() => Promise<any>);
  pending: boolean;
};

export const ScaleClusterForm = ({ submitForm, pending }: ScaleClusterFormProps) => {
  const modalData = useGlobalState((state) => state.modal.data) as any;
  const consoleURL = get(modalData, 'console.url', null);
  const region = get(modalData, 'rh_region_id', undefined);
  const isByoc = modalData.ccs?.enabled;
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const shouldDisplayClusterName = modalData.shouldDisplayClusterName || false;
  const cloudProviderID = get(modalData, 'cloud_provider.id', '');
  const billingModel = modalData.subscription?.cluster_billing_model;
  const product = modalData.subscription?.plan?.type;
  const isMultiAZ = modalData.multi_az;

  const { setFieldValue, getFieldProps, getFieldMeta, values, initialValues } =
    useFormikContext<FormikValues>();

  const showLoadBalancerAlert = useGlobalState((state) =>
    shouldShowLoadBalancerAlert(state, values.load_balancers),
  );
  const showPersistentStorageAlert = useGlobalState((state) =>
    shouldShowStorageQuotaAlert(state, values.persistent_storage),
  );

  const usageLink = consoleURL ? (
    <a
      href={`${consoleURL}/k8s/ns/default/resourcequotas`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Check your usage
    </a>
  ) : (
    'Check your usage'
  );

  const scalingAlert = (
    <Alert
      variant="warning"
      isInline
      title="Scaling below the current limit can cause problems in your environment"
    >
      <div>
        <p>
          {usageLink} before proceeding to be sure you are not scaling below what is currently being
          used.
        </p>
      </div>
    </Alert>
  );

  return (
    <Form onSubmit={submitForm}>
      <Grid hasGutter>
        {!isByoc && (
          <>
            <GridItem span={8}>
              <FormGroup fieldId="load_balancers" label="Load balancers">
                {/* @ts-ignore */}
                <Field
                  label="Load balancers"
                  name="load_balancers"
                  component={LoadBalancersDropdown}
                  input={{
                    // name, value, onBlur, onChange
                    ...getFieldProps('load_balancers'),
                    onChange: (value: string) => {
                      setFieldValue('load_balancers', value);
                    },
                  }}
                  meta={getFieldMeta('load_balancers')}
                  currentValue={initialValues.load_balancers}
                  disabled={pending}
                  cloudProviderID={cloudProviderID}
                  billingModel={billingModel}
                  product={product}
                  isBYOC={isByoc}
                  isMultiAZ={isMultiAZ}
                  region={region}
                />
              </FormGroup>
            </GridItem>
            <GridItem span={4} />
            {showLoadBalancerAlert && scalingAlert}
            <GridItem span={8}>
              <FormGroup fieldId="persistent_storage" label="Persistent storage">
                {/* @ts-ignore */}
                <Field
                  label="Persistent storage"
                  name="persistent_storage"
                  component={PersistentStorageDropdown}
                  input={{
                    // name, value, onBlur, onChange
                    ...getFieldProps('persistent_storage'),
                    onChange: (value: string) => {
                      setFieldValue('persistent_storage', value);
                    },
                  }}
                  meta={getFieldMeta('persistent_storage')}
                  disabled={pending}
                  currentValue={initialValues.persistent_storage}
                  cloudProviderID={cloudProviderID}
                  billingModel={billingModel}
                  product={product}
                  isBYOC={isByoc}
                  isMultiAZ={isMultiAZ}
                  region={region}
                />
              </FormGroup>
            </GridItem>
            <GridItem span={4} />
            {showPersistentStorageAlert && scalingAlert}
          </>
        )}
      </Grid>
    </Form>
  );
};
