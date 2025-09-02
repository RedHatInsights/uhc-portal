import React from 'react';

import { Label, PageSection } from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';

import ExternalLink from '../common/ExternalLink';

const content = [
  {
    title: 'Red Hat OpenShift Service on AWS learning hub',
    link: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/aws/learn',
    label: 'Documentation',
  },
  {
    title: 'Red Hat OpenShift Service on AWS (ROSA) interactive walkthrough',
    link: 'https://www.redhat.com/en/products/interactive-walkthrough/install-rosa',
    label: 'Walkthrough',
  },
  {
    title: 'Watch our Red Hat OpenShift Service on AWS video series',
    link: 'https://www.redhat.com/en/about/videos/rosa-lightboard',
    label: 'Video',
  },
];

const RosaHandsOnRecommendedContentTable = () => (
  <PageSection hasBodyWrapper={false} style={{ paddingBottom: 'unset', paddingTop: 'unset' }}>
    <Table aria-label="Recommended content table">
      {content.map((item) => (
        <Tbody>
          <Tr>
            <Td span={6}>{item.title}</Td>
            <Td span={3} style={{ textAlign: 'center' }}>
              <Label color="orange" style={{ width: '120px', display: 'block' }}>
                {item.label}
              </Label>
            </Td>
            <Td span={3} style={{ textAlign: 'right' }}>
              <ExternalLink href={item.link}>Learn more</ExternalLink>
            </Td>
          </Tr>
        </Tbody>
      ))}
    </Table>
  </PageSection>
);

export default RosaHandsOnRecommendedContentTable;
