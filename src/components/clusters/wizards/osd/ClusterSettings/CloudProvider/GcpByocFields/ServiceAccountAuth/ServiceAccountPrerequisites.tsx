import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

const ServiceAccountPrerequisites = () => (
  <div>
    <Content>
      <Content component={ContentVariants.p} className="ocm-secondary-text">
        Successful cluster provisioning requires that:
      </Content>

      <ul>
        <li>
          <Content component={ContentVariants.p} className="ocm-secondary-text">
            Your Google Cloud account has the necessary resource quotas and limits to support your
            desired cluster size according to the{' '}
            <ExternalLink noIcon href={links.OSD_CCS_GCP_LIMITS}>
              cluster resource requirements
            </ExternalLink>
          </Content>
        </li>
        <li>
          <Content component={ContentVariants.p} className="ocm-secondary-text">
            An IAM Service account called osd-ccs-admin exists with the following roles attached:
          </Content>
          <ul>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Compute Admin
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                DNS Administrator
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Security Admin
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Service Account Admin
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Service Account Key Admin
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Service Account User
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Organization Policy Viewer
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Service Management Administrator
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Service Usage Admin
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Storage Admin
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Compute Load Balancer Admin
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Role Viewer
              </Content>
            </li>
            <li>
              <Content component={ContentVariants.p} className="ocm-secondary-text">
                Role Administrator
              </Content>
            </li>
          </ul>
        </li>
      </ul>

      <Content component={ContentVariants.p} className="ocm-secondary-text">
        Enhanced Support from GCP is also recommended. To prevent potential conflicts, we recommend
        that you have no other resources provisioned in the project prior to provisioning OpenShift
        Dedicated. For more guidance, see the{' '}
        <ExternalLink noIcon href={links.OSD_CCS_GCP}>
          Customer Cloud Subscription requirements
        </ExternalLink>
        .
      </Content>
    </Content>
  </div>
);

export { ServiceAccountPrerequisites };
