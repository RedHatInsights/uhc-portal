import React from 'react';
import PropTypes from 'prop-types';

import {
  Content,
  ContentVariants,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

import { BackToAssociateAwsAccountLink } from '~/components/clusters/wizards/rosa/common/BackToAssociateAwsAccountLink';
import PopoverHintWithTitle from '~/components/common/PopoverHintWithTitle';

const ReviewRoleItem = ({ name, getRoleResponse, content }) => (
  <DescriptionListGroup key={name}>
    <DescriptionListTerm>{name} ARN</DescriptionListTerm>
    <DescriptionListDescription>
      {getRoleResponse?.pending && (
        <div className="spinner-fit-container">
          <Spinner size="md" />
        </div>
      )}
      {(getRoleResponse?.error || (!content && getRoleResponse?.fulfilled)) && (
        <PopoverHintWithTitle
          isErrorHint
          title={`${name} could not be detected`}
          bodyContent={
            <Content>
              <Content component={ContentVariants.p}>
                <span className="danger">
                  <ExclamationCircleIcon className="status-icon danger" />
                  <strong>{`${name} is no longer linked to your Red Hat organization.`}</strong>
                </span>
              </Content>
              <Content component={ContentVariants.p}>
                <p>Follow the AWS account association instructions and try again</p>
              </Content>
            </Content>
          }
          footer={<BackToAssociateAwsAccountLink />}
          iconClassName="hand-pointer"
        />
      )}
      {getRoleResponse?.fulfilled ? content : null}
    </DescriptionListDescription>
  </DescriptionListGroup>
);

ReviewRoleItem.propTypes = {
  name: PropTypes.string,
  getRoleResponse: PropTypes.object,
  content: PropTypes.string,
};

export default ReviewRoleItem;
