import React from 'react';

import docLinks from '../../../common/installLinks.mjs';
import OpenShiftProductIcon from '../../../styles/images/OpenShiftProductIcon.svg';

export interface BannerContentData {
  icon: React.JSX.Element;
  title: string;
  text: string;
  linkLabel: string;
  linkHref: string;
  iconCardBodyClassName: string;
}

export const osdBannerContents: BannerContentData = {
  icon: <img src={OpenShiftProductIcon} alt="OpenShift" />,
  title: 'Red Hat OpenShift Dedicated',
  text: 'Automate the deployment and management of your clusters on our fully managed cloud service dedicated to you. Focus on the applications and business, not managing infrastructure.',
  linkLabel: 'Learn more about OpenShift Dedicated',
  linkHref: docLinks.WHAT_IS_OSD,
  iconCardBodyClassName: 'rosa-aws-redhat-vertical-logo',
};

export const rosaBannerContents: BannerContentData = {
  icon: <img src={OpenShiftProductIcon} alt="OpenShift" />,
  title: 'Red Hat OpenShift Service on AWS (ROSA)',
  text: 'Quickly build, deploy, and scale applications with our fully-managed turnkey application platform.',
  linkLabel: 'Learn more about ROSA',
  linkHref: docLinks.WHAT_IS_ROSA,
  iconCardBodyClassName: 'rosa-aws-redhat-vertical-logo',
};
