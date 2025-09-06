import React from 'react';
import dayjs from 'dayjs';

import supportLinks from '~/common/supportLinks.mjs';
import { isRestrictedEnv, SUPPORT_CASE_URL } from '~/restrictedEnv';

import { SupportCase } from './model/SupportCase';

const productMap: { [index: string]: string } = {
  OSD: 'OpenShift Dedicated',
  ROSA: 'Red Hat OpenShift Service on AWS',
  ARO: 'OpenShift Managed (Azure)',
  OCP: 'OpenShift Container Platform',
};

export const getSupportCaseURL = (product?: string, version?: string, clusterUUID?: string) => {
  if (isRestrictedEnv()) {
    return SUPPORT_CASE_URL;
  }

  const productName = product ? productMap[product] : '';

  return `${supportLinks.SUPPORT_CASE_NEW_WITH_ISSUE}?clusterId=${clusterUUID}&caseCreate=true&product=${encodeURIComponent(
    productName,
  )}&version=${product !== 'OCP' ? encodeURIComponent(productName) : version}`;
};

const supportCaseRow = (supportCase: SupportCase) => {
  const caseID = (
    <a
      href={`${supportLinks.SUPPORT_CASE_VIEW}/${supportCase.caseID}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {supportCase.caseID}
    </a>
  );

  const lastModifiedDate = dayjs.utc(supportCase.lastModifiedDate).format('D MMM YYYY');

  const lastModifiedBy = (
    <>
      {supportCase.lastModifiedBy}
      <br />
      {lastModifiedDate}
    </>
  );
  return {
    cells: [
      caseID,
      supportCase.summary,
      supportCase.ownerID,
      lastModifiedBy,
      supportCase.severity,
      supportCase.status,
    ],
    caseID: supportCase.caseID,
  };
};

export { supportCaseRow };
