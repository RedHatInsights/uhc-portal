import React, { useMemo } from 'react';

import {
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Tooltip,
} from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';
import { AccessRequest } from '~/types/access_transparency.v1';

type AccessRequestDetailsProps = {
  accessRequest?: AccessRequest;
};

const AccessRequestDetails = ({ accessRequest }: AccessRequestDetailsProps) => {
  const decision = useMemo(
    () =>
      accessRequest?.decisions?.length
        ? accessRequest.decisions[accessRequest.decisions.length - 1]
        : undefined,
    [accessRequest],
  );

  return accessRequest ? (
    <Grid hasGutter>
      <GridItem sm={8}>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>ID</DescriptionListTerm>
            <DescriptionListDescription>{accessRequest.id}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Subscription ID</DescriptionListTerm>
            <DescriptionListDescription>{accessRequest.subscription_id}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Cluster ID</DescriptionListTerm>
            <DescriptionListDescription>{accessRequest.cluster_id}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Service Request ID</DescriptionListTerm>
            <DescriptionListDescription>
              {accessRequest.support_case_id || 'N/A'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </GridItem>
      <GridItem sm={4}>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>Created Time</DescriptionListTerm>
            <DescriptionListDescription>
              <Tooltip
                content={
                  <span>
                    Last updated on{' '}
                    {accessRequest.updated_at
                      ? new Date(accessRequest.updated_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                }
              >
                <Content component="p">
                  {accessRequest.created_at
                    ? new Date(accessRequest.created_at).toLocaleDateString()
                    : 'N/A'}
                </Content>
              </Tooltip>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              Respond By{' '}
              <PopoverHint
                id="respond-by-hint"
                iconClassName="nodes-hint"
                hint="If not reviewed, the Access Request will expire by this date and the original customer case or incident will be automatically closed without a technical resolution."
              />
            </DescriptionListTerm>
            <DescriptionListDescription>
              {accessRequest.deadline_at
                ? new Date(accessRequest.deadline_at).toLocaleDateString()
                : 'N/A'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              Request Duration{' '}
              <PopoverHint
                id="request-duration-hint"
                iconClassName="nodes-hint"
                hint="Once approved, SRE will have access to customer data in the cluster and in the corresponding cloud account for this amount of time. All access to customer data is audited."
              />
            </DescriptionListTerm>
            <DescriptionListDescription>
              {accessRequest.duration || 'N/A'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </GridItem>
      <GridItem sm={12}>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>Justification</DescriptionListTerm>
            <DescriptionListDescription>
              <span data-testid="justification-field-value">
                {accessRequest.justification || 'N/A'}
              </span>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </GridItem>
      {decision?.decision ? (
        <GridItem sm={12}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Decision</DescriptionListTerm>
              <DescriptionListDescription>
                <Content component="p" data-testid="decision-text">
                  <b>{decision?.decision}</b>
                  {decision?.created_at ? (
                    <>
                      {' '}
                      on <b>{new Date(decision.created_at).toLocaleDateString()}</b>
                    </>
                  ) : null}
                  {decision?.decided_by ? (
                    <>
                      {' '}
                      by <b>{decision.decided_by}</b>
                    </>
                  ) : null}
                  {decision?.justification ? (
                    <>
                      {' '}
                      because <i>{decision.justification}</i>
                    </>
                  ) : null}
                </Content>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      ) : null}
    </Grid>
  ) : null;
};

export default AccessRequestDetails;
