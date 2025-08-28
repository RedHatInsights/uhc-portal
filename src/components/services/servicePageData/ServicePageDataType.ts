import { BannerContentData } from './bannerContentData';
import { ExpandalbeContents } from './expandableContentsData';
import { GetStartedSection } from './getStartedSectionData';
import { LinkTextLabelLinkCardContents } from './linkTextServiceData';

type ServicePageDataType = {
  bannerContent: BannerContentData;
  benefitsExpandableContents: ExpandalbeContents[];
  featuresExpandableContents: ExpandalbeContents[];
  linkTextLabelLinkCardContents: LinkTextLabelLinkCardContents;
  getStartedSection: GetStartedSection;
  breadcrumbsLabel: string;
};

export { ServicePageDataType };
