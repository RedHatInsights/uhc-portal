import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { Content, ContentVariants, GridItem, Title } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

import links from '../../../../../common/installLinks.mjs';
import validators, {
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
} from '../../../../../common/validators';
import ExternalLink from '../../../../common/ExternalLink';
import ReduxVerticalFormGroup from '../../../../common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';

function CustomOperatorRoleNames({ isHypershiftSelected }) {
  const { getFieldProps, getFieldMeta } = useFormState();
  return (
    <>
      <GridItem>
        <Title headingLevel="h3">Name operator roles</Title>
      </GridItem>
      <GridItem span={10}>
        <Content component={ContentVariants.p}>
          To easily identify the Operator IAM roles for a cluster in your AWS account, the Operator
          role names are prefixed with your cluster name and a random 4-digit hash. You can
          optionally replace this prefix.
        </Content>
      </GridItem>
      <GridItem span={6}>
        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.CustomOperatorRolesPrefix}
          label="Custom operator roles prefix"
          type="text"
          // eslint-disable-next-line import/no-named-as-default-member
          validate={validators.checkCustomOperatorRolesPrefix}
          helpText={`Maximum ${MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH} characters.  Changing the cluster name will regenerate this value.`}
          extendedHelpText={
            <Content>
              <Content component={ContentVariants.p}>
                You can specify a custom prefix for the cluster-specific Operator IAM roles to use.{' '}
                <br />
                See examples in{' '}
                <ExternalLink
                  href={
                    isHypershiftSelected
                      ? links.ROSA_AWS_IAM_OPERATOR_ROLES
                      : links.ROSA_CLASSIC_AWS_IAM_OPERATOR_ROLES
                  }
                >
                  Defining a custom Operator IAM role prefix
                </ExternalLink>
              </Content>
            </Content>
          }
          input={getFieldProps(FieldId.CustomOperatorRolesPrefix)}
          meta={getFieldMeta(FieldId.CustomOperatorRolesPrefix)}
          showHelpTextOnError={false}
        />
      </GridItem>
    </>
  );
}

CustomOperatorRoleNames.propTypes = {
  isHypershiftSelected: PropTypes.bool,
};

export default CustomOperatorRoleNames;
