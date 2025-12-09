import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { GridItem, Title } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { CheckboxDescription } from '~/components/common/CheckboxDescription';
import ReduxCheckbox from '~/components/common/ReduxFormComponents_deprecated/ReduxCheckbox';

import ExternalLink from '../../common/ExternalLink';

import { constants } from './CreateOSDFormConstants';

function UserWorkloadMonitoringSection({ parent, disableUVM, planType }) {
  const { getFieldProps, getFieldMeta } = useFormState();

  const title = <Title headingLevel="h4"> Monitoring </Title>;
  const isROSA = planType === normalizedProducts.ROSA;
  const isOSD = planType === normalizedProducts.OSD || planType === normalizedProducts.OSDTrial;
  return (
    <>
      {parent === 'create' ? <GridItem>{title}</GridItem> : title}
      <Field
        component={ReduxCheckbox}
        fieldId={FieldId.EnableUserWorkloadMonitoring}
        name={FieldId.EnableUserWorkloadMonitoring}
        label="Enable user workload monitoring"
        isDisabled={disableUVM}
        input={getFieldProps(FieldId.EnableUserWorkloadMonitoring)}
        meta={getFieldMeta(FieldId.EnableUserWorkloadMonitoring)}
        extendedHelpText={
          <>
            {constants.enableUserWorkloadMonitoringHelp}{' '}
            {isROSA || isOSD ? (
              <ExternalLink
                href={isROSA ? links.ROSA_CLASSIC_MONITORING : links.OSD_MONITORING_STACK}
              >
                Learn more
              </ExternalLink>
            ) : null}
          </>
        }
      />
      <CheckboxDescription>{constants.enableUserWorkloadMonitoringHint}</CheckboxDescription>
    </>
  );
}

UserWorkloadMonitoringSection.propTypes = {
  parent: PropTypes.string,
  disableUVM: PropTypes.bool,
  planType: PropTypes.string,
};

export default UserWorkloadMonitoringSection;
