import React, { useMemo } from 'react';

import { PageSection, Title } from '@patternfly/react-core';

import { BREADCRUMB_PATHS, buildBreadcrumbs } from '~/common/breadcrumbPaths';
import { AppPage } from '~/components/App/AppPage';
import Breadcrumbs from '~/components/common/Breadcrumbs';

import { ListTextLabelLinkCard } from '../../common/ListTextLabelLinkCard/ListTextLabelLinkCard';
import { ExpandableListCard } from '../common/ExpandableListCard';
import { GetStartedSection } from '../common/GetStartedSection';
import { OSDPricingCard } from '../common/OSDPricingCard';
import { ProductBanner } from '../common/ProductBanner';
import { RosaPricingCard } from '../common/RosaPricingCard';
import { ServiceLogo } from '../common/ServiceLogo';
import { osdBannerContents, rosaBannerContents } from '../servicePageData/bannerContentData';
import {
  osdBenefitsExpandableContents,
  osdFeaturesExpandableContents,
  rosaBenefitsExpandableContents,
  rosaFeaturesExpandableContents,
} from '../servicePageData/expandableContentsData';
import {
  osdGetStartedSectionData,
  rosaGetStartedSectionData,
} from '../servicePageData/getStartedSectionData';
import {
  osdLinkTextLabelLinkCardContents,
  rosaLinkTextLabelLinkCardContents,
} from '../servicePageData/linkTextServiceData';
import { ServicePageDataType } from '../servicePageData/ServicePageDataType';

import './ServicePage.scss';

interface ServicePageProps {
  serviceName: string;
}

export const ServicePage = ({ serviceName }: ServicePageProps) => {
  const data = useMemo((): ServicePageDataType => {
    switch (serviceName) {
      case 'OSD':
        return {
          bannerContent: osdBannerContents,
          benefitsExpandableContents: osdBenefitsExpandableContents,
          featuresExpandableContents: osdFeaturesExpandableContents,
          linkTextLabelLinkCardContents: osdLinkTextLabelLinkCardContents,
          getStartedSection: osdGetStartedSectionData,
          breadcrumbsLabel: 'Red Hat OpenShift Dedicated',
        };
      case 'ROSA':
      default:
        return {
          bannerContent: rosaBannerContents,
          benefitsExpandableContents: rosaBenefitsExpandableContents,
          featuresExpandableContents: rosaFeaturesExpandableContents,
          linkTextLabelLinkCardContents: rosaLinkTextLabelLinkCardContents,
          getStartedSection: rosaGetStartedSectionData,
          breadcrumbsLabel: 'Red Hat OpenShift Service on AWS',
        };
    }
  }, [serviceName]);

  return (
    <AppPage>
      <ProductBanner
        icon={<ServiceLogo serviceName={serviceName} />}
        title={data.bannerContent.title}
        text={data.bannerContent.text}
        linkLabel={data.bannerContent.linkLabel}
        linkHref={data.bannerContent.linkHref}
        breadcrumbs={
          <Breadcrumbs
            path={buildBreadcrumbs(BREADCRUMB_PATHS.OVERVIEW, {
              label: data.breadcrumbsLabel,
            })}
          />
        }
      />
      <PageSection hasBodyWrapper={false}>
        <GetStartedSection {...data.getStartedSection} />

        <Title className="pf-v6-u-mt-lg pf-v6-u-mb-lg" headingLevel="h2">
          Benefits
        </Title>
        <ExpandableListCard items={data.benefitsExpandableContents} />

        <Title className="pf-v6-u-mt-lg pf-v6-u-mb-lg" headingLevel="h2">
          Features
        </Title>
        <ExpandableListCard items={data.featuresExpandableContents} />

        {serviceName === 'OSD' ? <OSDPricingCard /> : null}
        {serviceName === 'ROSA' ? <RosaPricingCard /> : null}
        <Title headingLevel="h2" className="pf-v6-u-mt-lg pf-v6-u-mb-lg">
          Recommended content
        </Title>

        <ListTextLabelLinkCard {...data.linkTextLabelLinkCardContents} />
      </PageSection>
    </AppPage>
  );
};
